import { commandCategories } from './commands.js';

const resizer = document.getElementById('resizer');
const commands = document.getElementById('commands');
const consoleDiv = document.getElementById('console');
let isResizing = false;

// Session Management
let sessionToken = null;
const SESSION_DURATION = 3600000; // 1 hour
let sessionTimeout;

// User Authentication
const VALID_CREDENTIALS = {
    "admin": "Oizom_4932",
    "supadmin" : "supadmin"
};

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.toggle-password');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    }
}
window.togglePassword = togglePassword;

async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (VALID_CREDENTIALS[username] === password) {
        const role = username === "supadmin" ? "supadmin" : "admin"; // Assign role based on username
        sessionToken = Math.random().toString(36).substring(2);
        resetSessionTimeout();

        showToast("Login successful!", "success");

        // Update UI
        document.getElementById("login-screen").classList.add("hidden");
        document.getElementById("dashboard").classList.remove("hidden");
        document.getElementById("user-name").textContent = username;

        filterNavigationByRole(role);
        sessionStorage.setItem("role", role);
    } else {
        showToast("Invalid credentials", "error");
        event.target.reset();
    }
}
window.handleLogin = handleLogin;
function filterNavigationByRole(role) {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach((item) => {
        const roles = item.getAttribute("data-role");
        if (roles && !roles.split(",").includes(role)) {
            item.classList.add("hidden");
        } else {
            item.classList.remove("hidden");
        }
    });
}

function handleLogout() {
    sessionToken = null;
    clearTimeout(sessionTimeout);
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.reset();
    }
    document.getElementById("dashboard").classList.add("hidden");
    document.getElementById("login-screen").classList.remove("hidden");
    clearConsole();
    showToast("Logged out successfully", "success");
}
window.handleLogout = handleLogout;
function resetSessionTimeout() {
    clearTimeout(sessionTimeout);
    sessionTimeout = setTimeout(() => {
        if (sessionToken) {
            handleLogout();
            showToast("Session expired. Please login again.", "error");
        }
    }, SESSION_DURATION);
}
window.resetSessionTimeout = resetSessionTimeout;

function showCommands(category) {
    const commandsList = document.getElementById("commands-list");
    const role = sessionStorage.getItem("role");
    commandsList.innerHTML = "";

    if (commandCategories[category]) {
        for (const [name, details] of Object.entries(commandCategories[category])) {
            if (role === "admin" && category === "docker") {
                const allowedCommands = ["Docker PS", "Gateway Logs"];
                if (!allowedCommands.includes(name)) {
                    continue;
                }
            }
    
            const button = document.createElement("button");
            button.className = "command-btn";
            button.innerHTML = `<i class="${details.icon}"></i> ${name}`;
            button.onclick = () => executeCommand(name, details.command);
            commandsList.appendChild(button);
        }
    }    
}
window.showCommands = showCommands;

function filterCommands() {
    const searchTerm = document.getElementById("search-bar").value.toLowerCase();
    const commandsList = document.getElementById("commands-list");
    const role = sessionStorage.getItem("role");
    
    commandsList.innerHTML = "";
    
    for (const category in commandCategories) {
        for (const [name, details] of Object.entries(commandCategories[category])) {
            if (role === "admin" && category === "docker") {
                const allowedCommands = ["Docker PS", "Gateway Logs"];
                if (!allowedCommands.includes(name)) {
                    continue;
                }
            } else if (role === "admin") {
                continue;
            }

            if (name.toLowerCase().includes(searchTerm) || 
                details.command.toLowerCase().includes(searchTerm)) {
                const button = document.createElement("button");
                button.className = "command-btn";
                button.innerHTML = `<i class="${details.icon}"></i> ${name}`;
                button.onclick = () => executeCommand(name, details.command);
                commandsList.appendChild(button);
            }
        }
    }
}
window.filterCommands = filterCommands;

let logHistory = [];

async function executeCommand(name, command) {
    if (!sessionToken) {
        showToast("Session expired. Please login again.", "error");
        handleLogout();
        return;
    }
    const consoleOutput = document.getElementById("console-output");

    try {
        // Add command to console
        const commandLog = { name, command, response: null, status: null };
        consoleOutput.innerHTML += `\n\n> Executing Command: ${name}`;
        consoleOutput.innerHTML += `\nCommand: ${command}`;
        consoleOutput.innerHTML += "\n--------------------";
        consoleOutput.scrollTop = consoleOutput.scrollHeight;

        // Send API request
        const response = await fetch("/execute", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionToken}`,
            },
            body: JSON.stringify({ command }),
        });

       

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Beautify output
        if (result.status === "success") {
            commandLog.status = "success";
            commandLog.response = result.stdout || "No output";

            consoleOutput.innerHTML += `\n[STATUS]: SUCCESS ✅\n`;
            consoleOutput.innerHTML += `\n[OUTPUT]:\n${result.stdout || "No output"}\n`;
        } else {
            commandLog.status = "failed";
            commandLog.response = result.stderr || "No error message";

            consoleOutput.innerHTML += `\n[STATUS]: FAILED ❌\n`;
            consoleOutput.innerHTML += `\n[ERROR]:\n${result.stderr || "No error message"}\n`;
        }

        logHistory.push(commandLog);
    } catch (error) {
        consoleOutput.innerHTML += `\n[STATUS]: ERROR ❌\n`;
        consoleOutput.innerHTML += `\n[MESSAGE]: ${error.message}`;
        logHistory.push({ name, command, response: error.message, status: "error" });
    } finally {
        consoleOutput.innerHTML += "\n--------------------";
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
       
    }

    // Reset session timeout
    resetSessionTimeout();
}

async function fetchAndUpdatesStats() {
    const totalCommands = getTotalCommands();
    const lastCommand = lastCommandName;
    const res = await fetch(`/stats?total_commands=${totalCommands}&last_command=${encodeURIComponent(lastCommand)}`);
    const data = await res.json();
    updateStats(data.total_commands, data.last_command, data.uptime);

}

function downloadLogs() {
    const blob = new Blob([JSON.stringify(logHistory, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "console_data_logs.json";
    link.click();
}
window.downloadLogs = downloadLogs;

function clearConsole() {
    document.getElementById("console-output").innerHTML = 
        "Console cleared. Select a command to begin...";
}
window.clearConsole = clearConsole;
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toast-message");
    
    // Update toast content
    toastMessage.textContent = message;
    toast.className = `toast show ${type}`;
    // Show toast
    // toast.classList.add("show");
    const icon = toast.querySelector("i");
    if (type === "success") {
        icon.className = "fas fa-check-circle";
    } else if (type === "error") {
        icon.className = "fas fa-exclamation-circle";
    }
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
    // Handle form submission
    document.getElementById("login-form").addEventListener("submit", handleLogin);
    const logoutButton = document.getElementsByClassName("logout-btn")[0]; // Select the first element
    if (logoutButton) {
        logoutButton.addEventListener("click", handleLogout);
    }
    // Add keyboard shortcuts
    document.addEventListener("keydown", (e) => {
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === "k") {
            e.preventDefault();
            document.getElementById("search-bar").focus();
        }
        
        // Esc to clear console
        if (e.key === "Escape") {
            clearConsole();
        }
    });
    
    // Handle activity to reset session timeout
    ["click", "keypress", "mousemove", "touchstart"].forEach(event => {
        document.addEventListener(event, () => {
            if (sessionToken) {
                resetSessionTimeout();
            }
        });
    });
});

resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.body.style.cursor = 'ew-resize';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
});

function handleMouseMove(e) {
    if (!isResizing) return;

    const containerRect = resizer.parentNode.getBoundingClientRect();
    const newCommandsWidth = e.clientX - containerRect.left;

    if (newCommandsWidth > 100 && newCommandsWidth < containerRect.width - 100) {
        commands.style.flex = `0 0 ${newCommandsWidth}px`;
        consoleDiv.style.flex = `1`; 
    }
}

function stopResizing() {
    isResizing = false;
    document.body.style.cursor = '';
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
}

window.toggleTheme = function() {
    document.body.classList.toggle('dark-theme');
    // Icon change
    const icon = document.querySelector('.theme-btn i');
    if (icon) {
        icon.className = document.body.classList.contains('dark-theme') ? 'fas fa-sun' : 'fas fa-moon';
        
    }
}


const notification = [
    { message: "Device restarted successfully.", type: "success", time: "2 min ago" },
    { message: "Low disk space warning.", type: "warning", time: "10 min ago" }
];

function renderNotifications() {
    const list = document.getElementById("notification-list");
    if (!list) return; // prevent error if element not found
    list.innerHTML = "";
    notification.forEach(n => {
        const div = document.createElement("div");
        div.className = "notification-item";
        div.innerHTML = `<span>${n.message}</span><br><small style="color:#888">${n.time}</small>`;
        list.appendChild(div);
    });

    // badge

    const badge = document.getElementById("notification-badge");
    if (badge) {
    if (notification.length > 0) {
        badge.style.display = "inline-block";
        badge.innerText = notification.length;
    } else {
        badge.style.display = "none";
    }
 }
}

function toggleNotifications() {
        const dropdown = document.getElementById("notification-dropdown");
        dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
        // hide dropdown when clicking outside

        if (dropdown.style.display === "block") {
            document.addEventListener("mousedown", hideNotificationsOnClickOutside);
            
        }
    }
    window.toggleNotifications = toggleNotifications;


    function hideNotificationsOnClickOutside(e) {
        const dropdown = document.getElementById("notification-dropdown");
        const bell = document.querySelector(".notification-bell");
        if (!bell.contains(e.target)) {
            dropdown.style.display = "none";
            document.removeEventListener("mousedown", hideNotificationsOnClickOutside);

        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        renderNotifications();
    });