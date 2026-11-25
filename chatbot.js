
/* =========================================
   MERIT NOVA AI
   Interactive Chatbot Workspace
========================================= */


/* ---------- ELEMENT SELECTORS ---------- */

const $ = (id) => document.getElementById(id);

const sidebar = $("sidebar");
const sidebarClose = $("sidebarClose");
const menuToggle = $("menuToggle");

const newChatButton = $("newChatButton");
const searchChatsButton = $("searchChatsButton");
const sidebarSearch = $("sidebarSearch");
const chatSearchInput = $("chatSearchInput");

const scheduledButton = $("scheduledButton");
const libraryButton = $("libraryButton");
const meetingSummaryButton = $("meetingSummaryButton");
const settingsButton = $("settingsButton");

const recentChats = $("recentChats");
const recentCount = $("recentCount");

const themeButton = $("themeButton");

const welcomeSection = $("welcomeSection");
const conversationArea = $("conversationArea");
const chatBox = $("chatBox");
const greetingMessage = $("greetingMessage");

const chatForm = $("chatForm");
const userInput = $("userInput");
const sendButton = $("sendButton");

const attachButton = $("attachButton");
const attachmentMenu = $("attachmentMenu");
const uploadImageButton = $("uploadImageButton");
const uploadFileButton = $("uploadFileButton");

const imageButton = $("imageButton");
const fileButton = $("fileButton");
const imageInput = $("imageInput");
const fileInput = $("fileInput");

const micButton = $("micButton");

const selectedFiles = $("selectedFiles");
const toastMessage = $("toastMessage");
// Hide greeting when the user clicks the message input

userInput.addEventListener("focus", function () {

    const greeting = document.getElementById("greetingMessage");

    if (greeting) {
        greeting.remove();
    }

});

/* =========================================
   NOTIFICATION MESSAGE
========================================= */

let toastTimer;

function showToast(message) {

    if (!toastMessage) return;

    toastMessage.textContent = message;
    toastMessage.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toastMessage.classList.remove("show");
    }, 2500);
}


/* =========================================
   CHAT STORAGE
========================================= */

const STORAGE_KEY = "meritNovaChats";

let chats = [];

let currentChatId = null;

function loadChats() {

    try {

        const savedChats = localStorage.getItem(STORAGE_KEY);

        chats = savedChats ? JSON.parse(savedChats) : [];

        if (!Array.isArray(chats)) {
            chats = [];
        }

    } catch (error) {

        chats = [];

    }

}

function saveChats() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(chats)
        );

    } catch (error) {

        showToast("Unable to save chats in this browser.");

    }

}

function createChat() {

    const chat = {

        id: Date.now().toString(),

        title: "New Conversation",

        messages: [],

        updatedAt: Date.now()

    };

    chats.unshift(chat);

    currentChatId = chat.id;

    saveChats();

    renderRecentChats();

    return chat;

}

function getCurrentChat() {

    return chats.find(
        chat => chat.id === currentChatId
    );

}


/* =========================================
   RECENT CHAT LIST
========================================= */


function renderRecentChats(filter = "") {

    if (!recentChats || !recentCount) return;

    recentChats.innerHTML = "";

    const searchText = filter.toLowerCase().trim();

    const filteredChats = chats.filter(chat =>
        chat.title.toLowerCase().includes(searchText)
    );

    recentCount.textContent = filteredChats.length;

    if (filteredChats.length === 0) {

        const emptyMessage = document.createElement("p");

        emptyMessage.className = "empty-history";

        emptyMessage.textContent = searchText
            ? "No matching conversations found."
            : "Your conversations will appear here.";

        recentChats.appendChild(emptyMessage);

        return;
    }

    filteredChats.forEach(chat => {

        const chatRow = document.createElement("div");

        chatRow.className = "recent-chat-row";

        const chatButton = document.createElement("button");

        chatButton.type = "button";

        chatButton.className = "recent-chat-item";

        chatButton.textContent = chat.title;

        chatButton.title = chat.title;

        chatButton.addEventListener("click", () => {
            openChat(chat.id);
        });

        const deleteButton = document.createElement("button");

        deleteButton.type = "button";

        deleteButton.className = "delete-chat-button";

        deleteButton.textContent = "×";

        deleteButton.title = "Delete this chat";

        deleteButton.setAttribute(
            "aria-label",
            "Delete " + chat.title
        );

        deleteButton.addEventListener("click", () => {
            deleteChat(chat.id);
        });

        chatRow.appendChild(chatButton);

        chatRow.appendChild(deleteButton);

        recentChats.appendChild(chatRow);

    });

}


/* DELETE INDIVIDUAL CHAT */

function deleteChat(chatId) {

    const chat = chats.find(item => item.id === chatId);

    if (!chat) return;

    const confirmed = confirm(
        "Are you sure you want to delete this conversation?"
    );

    if (!confirmed) return;

    chats = chats.filter(item => item.id !== chatId);

    if (currentChatId === chatId) {

        currentChatId = null;

        chatBox.innerHTML = "";

        showWelcome();

    }

    saveChats();

    renderRecentChats(chatSearchInput?.value || "");

    showToast("Conversation deleted.");

}


function openChat(chatId) {

    const chat = chats.find(item => item.id === chatId);

    if (!chat) return;

    currentChatId = chatId;

    chatBox.innerHTML = "";

    if (chat.messages.length === 0) {

        const message = document.createElement("div");

        message.className = "message bot-message";

        message.textContent =
            "Hello! 👋 What would you like to learn today?";

        chatBox.appendChild(message);

    } else {

        chat.messages.forEach(message => {

            addMessageToScreen(
                message.text,
                message.sender,
                false
            );

        });

    }

    showConversation();

    renderRecentChats();

    closeMobileSidebar();

}


/* =========================================
   SHOW AND HIDE WELCOME SCREEN
========================================= */

function showConversation() {

    if (welcomeSection) {

        welcomeSection.classList.add("hidden");

    }

    if (conversationArea) {

        conversationArea.scrollTop =
            conversationArea.scrollHeight;

    }

}

function showWelcome() {

    if (welcomeSection) {

        welcomeSection.classList.remove("hidden");

    }

}


/* =========================================
   NEW CHAT
========================================= */

function startNewChat() {

    currentChatId = null;

    chatBox.innerHTML = "";

    if (greetingMessage) {

        const greeting = document.createElement("div");

        greeting.className = "message bot-message";

        greeting.textContent =
            "Hello! 👋 I'm your AI study assistant. What would you like to learn today?";

        greeting.id = "greetingMessage";

        chatBox.appendChild(greeting);

    }

    userInput.value = "";

    if (selectedFiles) {

        selectedFiles.innerHTML = "";

    }

    if (imageInput) imageInput.value = "";

    if (fileInput) fileInput.value = "";

    showWelcome();


    closeAttachmentMenu();

}

if (newChatButton) {

    newChatButton.addEventListener("click", startNewChat);

}


/* =========================================
   DISPLAY CHAT MESSAGES
========================================= */

function addMessageToScreen(text, sender, scroll = true) {

    const message = document.createElement("div");

    message.classList.add("message");

    if (sender === "user") {

        message.classList.add("user-message");

    } else {

        message.classList.add("bot-message");

    }

    message.textContent = text;

    chatBox.appendChild(message);

    if (scroll && conversationArea) {

        conversationArea.scrollTop =
            conversationArea.scrollHeight;

    }

}


/* =========================================
   SEND MESSAGE
========================================= */

function sendMessage(text) {

    const messageText = text.trim();

    if (!messageText) {

        showToast("Please enter a message first.");

        return;

    }

    let chat = getCurrentChat();

    if (!chat) {

        chat = createChat();

    }

    chat.messages.push({

        sender: "user",

        text: messageText

    });

    chat.title = messageText.length > 32
        ? messageText.substring(0, 32) + "..."
        : messageText;

    chat.updatedAt = Date.now();

    addMessageToScreen(messageText, "user");

    userInput.value = "";

    showConversation();

    saveChats();

    renderRecentChats();

    /*
       DEMO RESPONSE

       This is a temporary frontend response.
       A real AI API/backend will be connected later.
    */

    setTimeout(() => {

        const response =
            "Thanks for your question! Your Merit Nova AI assistant interface is ready. Connect an AI backend to receive intelligent answers to your questions.";

        addMessageToScreen(response, "bot");

        chat.messages.push({

            sender: "bot",

            text: response

        });

        chat.updatedAt = Date.now();

        saveChats();

        renderRecentChats();

    }, 700);

}

if (chatForm) {

    chatForm.addEventListener("submit", (event) => {

        event.preventDefault();

        sendMessage(userInput.value);

    });

}


/* =========================================
   SUBJECT SELECTION
========================================= */

function selectSubject(subject) {

    userInput.value =
        "Help me learn " + subject + ". Explain it in simple words.";

    userInput.focus();

    showToast(subject + " selected.");

}

document.querySelectorAll("[data-subject]").forEach(button => {

    button.addEventListener("click", () => {

        const subject = button.dataset.subject;

        selectSubject(subject);

    });

});


/* =========================================
   SIDEBAR SEARCH
========================================= */

if (searchChatsButton) {

    searchChatsButton.addEventListener("click", () => {

        if (!sidebarSearch) return;

        sidebarSearch.classList.toggle("active");

        if (sidebarSearch.classList.contains("active")) {

            chatSearchInput.focus();

        } else {

            chatSearchInput.value = "";

            renderRecentChats();

        }

    });

}

if (chatSearchInput) {

    chatSearchInput.addEventListener("input", () => {

        renderRecentChats(chatSearchInput.value);

    });

}


/* =========================================
   MOBILE SIDEBAR
========================================= */

if (menuToggle) {

    menuToggle.addEventListener("click", () => {

        sidebar.classList.toggle("open");

    });

}

function closeMobileSidebar() {

    if (window.innerWidth <= 650 && sidebar) {

        sidebar.classList.remove("open");

    }

}

if (sidebarClose) {

    sidebarClose.addEventListener("click", () => {

        closeMobileSidebar();

    });

}


/* =========================================
   SIDEBAR OTHER OPTIONS
========================================= */

if (scheduledButton) {

    scheduledButton.addEventListener("click", () => {

        showToast("Scheduled feature will be available soon.");

    });

}

if (libraryButton) {

    libraryButton.addEventListener("click", () => {

        showToast("Your study library is coming soon.");

    });

}

if (meetingSummaryButton) {

    meetingSummaryButton.addEventListener("click", () => {

        showToast("Meeting Summary feature is coming soon.");

    });

}

if (settingsButton) {

    settingsButton.addEventListener("click", () => {

        showToast("Settings feature is coming soon.");

    });

}


/* =========================================
   DARK AND LIGHT THEME
========================================= */

const THEME_KEY = "meritNovaTheme";

function updateThemeButton() {

    if (!themeButton) return;

    const darkMode =
        document.body.classList.contains("dark-theme");

    themeButton.textContent = darkMode ? "☀" : "☾";

    themeButton.title = darkMode
        ? "Switch to light theme"
        : "Switch to dark theme";

    themeButton.setAttribute(
        "aria-label",
        themeButton.title
    );

}

function loadTheme() {

    const savedTheme = localStorage.getItem(THEME_KEY);

    if (savedTheme === "dark") {

        document.body.classList.add("dark-theme");

    } else {

        document.body.classList.remove("dark-theme");

    }

    updateThemeButton();

}

if (themeButton) {

    themeButton.addEventListener("click", () => {

        document.body.classList.toggle("dark-theme");

        const darkMode =
            document.body.classList.contains("dark-theme");

        localStorage.setItem(
            THEME_KEY,
            darkMode ? "dark" : "light"
        );

        updateThemeButton();

    });

}


/* =========================================
   ATTACHMENT MENU
========================================= */

function closeAttachmentMenu() {

    if (attachmentMenu) {

        attachmentMenu.classList.remove("active");

    }

}

if (attachButton) {

    attachButton.addEventListener("click", () => {

        attachmentMenu.classList.toggle("active");

    });

}

document.addEventListener("click", (event) => {

    if (
        attachmentMenu &&
        attachButton &&
        !attachmentMenu.contains(event.target) &&
        !attachButton.contains(event.target)
    ) {

        closeAttachmentMenu();

    }

});


/* =========================================
   IMAGE AND FILE UPLOAD
========================================= */

function openImagePicker() {

    if (imageInput) {

        imageInput.click();

    }

    closeAttachmentMenu();

}

function openFilePicker() {

    if (fileInput) {

        fileInput.click();

    }

    closeAttachmentMenu();

}

if (imageButton) {

    imageButton.addEventListener("click", openImagePicker);

}

if (uploadImageButton) {

    uploadImageButton.addEventListener("click", openImagePicker);

}

if (fileButton) {

    fileButton.addEventListener("click", openFilePicker);

}

if (uploadFileButton) {

    uploadFileButton.addEventListener("click", openFilePicker);

}


/* SHOW SELECTED FILES */

function displaySelectedFiles(files) {

    if (!selectedFiles) return;

    Array.from(files).forEach(file => {

        const fileTag = document.createElement("span");

        fileTag.className = "selected-file";

        fileTag.textContent = "📎 " + file.name;

        selectedFiles.appendChild(fileTag);

    });

    if (files.length > 0) {

        showToast(files.length + " file(s) selected.");

    }

}

if (imageInput) {

    imageInput.addEventListener("change", () => {

        displaySelectedFiles(imageInput.files);

    });

}

if (fileInput) {

    fileInput.addEventListener("change", () => {

        displaySelectedFiles(fileInput.files);

    });

}


/* =========================================
   MICROPHONE / SPEECH RECOGNITION
   HOLD TO SPEAK
========================================= */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let recognition = null;

let isMicHeld = false;

let speechBaseText = "";

let speechSessionText = "";

let recognitionSupported = Boolean(SpeechRecognition);


/* UPDATE INPUT WITHOUT LOSING OLD WORDS */

function updateSpeechInput(interimText = "") {

    const combinedText = [

        speechBaseText,

        speechSessionText,

        interimText

    ]
        .map(text => text.trim())
        .filter(Boolean)
        .join(" ");

    userInput.value = combinedText;

    userInput.dispatchEvent(
        new Event("input", { bubbles: true })
    );

}


/* STOP MICROPHONE */

function stopMicrophone() {

    if (!recognitionSupported) return;

    isMicHeld = false;

    if (recognition) {

        try {

            recognition.stop();

        } catch (error) {

            console.log("Microphone already stopped.");

        }

    }

}


/* START MICROPHONE */

function startMicrophone() {

    if (!recognitionSupported) {

        showToast(
            "Voice input is not supported in this browser. Try Chrome."
        );

        return;

    }

    if (isMicHeld) return;

    speechBaseText = userInput.value.trim();

    speechSessionText = "";

    isMicHeld = true;

    recognition = new SpeechRecognition();

    recognition.lang = "en-IN";

    recognition.continuous = true;

    recognition.interimResults = true;

    recognition.onstart = () => {

        if (micButton) {

            micButton.classList.add("recording");

        }

        showToast("Listening... Release the button to stop.");

    };


    /* RECOGNISE SPEECH */

    recognition.onresult = (event) => {

        let finalText = "";

        let interimText = "";

        for (
            let i = 0;
            i < event.results.length;
            i++
        ) {

            const transcript =
                event.results[i][0].transcript;

            if (event.results[i].isFinal) {

                finalText += transcript + " ";

            } else {

                interimText += transcript + " ";

            }

        }

        speechSessionText = finalText.trim();

        updateSpeechInput(interimText);

    };


    /* HANDLE ERRORS */

    recognition.onerror = (event) => {

        console.log(
            "Speech recognition error:",
            event.error
        );

        if (event.error === "not-allowed") {

            showToast(
                "Please allow microphone access in your browser."
            );

        } else if (event.error === "no-speech") {

            showToast("No speech detected. Try again.");

        }

        stopMicrophone();

    };


    /* FINISH SPEECH SESSION */

    recognition.onend = () => {

        updateSpeechInput();

        if (micButton) {

            micButton.classList.remove("recording");

        }

        if (isMicHeld) {

            isMicHeld = false;

        }

        if (userInput.value.trim()) {

            showToast("Speech added to your message.");

        }

    };


    try {

        recognition.start();

    } catch (error) {

        isMicHeld = false;

        if (micButton) {

            micButton.classList.remove("recording");

        }

        showToast("Unable to start microphone. Try again.");

    }

}


/* HOLD THE BUTTON TO SPEAK */

if (micButton) {

    micButton.addEventListener("pointerdown", (event) => {

        event.preventDefault();

        startMicrophone();

    });

    micButton.addEventListener("pointerup", (event) => {

        event.preventDefault();

        stopMicrophone();

    });

    micButton.addEventListener("pointercancel", () => {

        stopMicrophone();

    });

    micButton.addEventListener("lostpointercapture", () => {

        stopMicrophone();

    });

    /* Keyboard support */

    micButton.addEventListener("keydown", (event) => {

        if (
            (event.code === "Space" || event.code === "Enter") &&
            !event.repeat
        ) {

            event.preventDefault();

            startMicrophone();

        }

    });

    micButton.addEventListener("keyup", (event) => {

        if (
            event.code === "Space" ||
            event.code === "Enter"
        ) {

            event.preventDefault();

            stopMicrophone();

        }

    });

}


/* =========================================
   CLOSE MOBILE SIDEBAR AFTER RESIZE
========================================= */

window.addEventListener("resize", () => {

    if (window.innerWidth > 650 && sidebar) {

        sidebar.classList.remove("open");

    }

});


/* =========================================
   INITIALIZE APPLICATION
========================================= */

function initializeApp() {

    loadChats();

    loadTheme();

    renderRecentChats();

    showWelcome();


    console.log("Merit Nova AI initialized successfully.");

}

initializeApp();
