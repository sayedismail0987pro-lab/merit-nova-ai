
/* ==========================================
   MERIT NOVA AI - CHATBOT FUNCTIONALITY
   ========================================== */

const $ = (id) => document.getElementById(id);

const chatBox = $("chatBox");
const chatForm = $("chatForm");
const userInput = $("userInput");
const welcomeSection = $("welcomeSection");

const sidebar = $("sidebar");
const recentChats = $("recentChats");
const recentCount = $("recentCount");

const imageInput = $("imageInput");
const fileInput = $("fileInput");
const selectedFiles = $("selectedFiles");

const attachmentMenu = $("attachmentMenu");
const toastMessage = $("toastMessage");

let conversations = [];

try {
    conversations = JSON.parse(
        localStorage.getItem("meritNovaChats") || "[]"
    );

    if (!Array.isArray(conversations)) {
        conversations = [];
    }
} catch {
    conversations = [];
}

let currentChatId = null;
let currentMessages = [];
let selectedAttachments = [];
let recognition = null;
let toastTimer;
let recording = false;

/* ------------------------------------------
   NOTIFICATION
------------------------------------------ */

function showToast(message) {
    toastMessage.textContent = message;
    toastMessage.classList.add("visible");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toastMessage.classList.remove("visible");
    }, 2800);
}

/* ------------------------------------------
   SAVE CONVERSATIONS
------------------------------------------ */

function saveConversations() {
    try {
        localStorage.setItem(
            "meritNovaChats",
            JSON.stringify(conversations)
        );
    } catch {
        showToast("Storage is full. Some chats could not be saved.");
    }
}

/* ------------------------------------------
   ADD CHAT MESSAGE
------------------------------------------ */

function addMessage(text, sender) {
    const message = document.createElement("div");

    message.className =
        "message " +
        (sender === "user" ? "user-message" : "bot-message");

    message.textContent = text;

    chatBox.appendChild(message);

    currentMessages.push({
        text: text,
        sender: sender
    });

    chatBox.scrollTop = chatBox.scrollHeight;
}

/* ------------------------------------------
   SAVE CURRENT CHAT
------------------------------------------ */

function saveCurrentChat() {
    if (currentMessages.length === 0) return;

    if (!currentChatId) {
        currentChatId = Date.now().toString();
    }

    const firstQuestion = currentMessages.find(
        message => message.sender === "user"
    );

    const title = firstQuestion
        ? firstQuestion.text.slice(0, 38)
        : "New conversation";

    const existingIndex = conversations.findIndex(
        chat => chat.id === currentChatId
    );

    const conversation = {
        id: currentChatId,
        title: title,
        messages: currentMessages,
        updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
        conversations[existingIndex] = conversation;
    } else {
        conversations.unshift(conversation);
    }

    conversations.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );

    conversations = conversations.slice(0, 50);

    saveConversations();
    renderRecentChats();
}

/* ------------------------------------------
   SHOW RECENT CHATS
------------------------------------------ */

function renderRecentChats(searchText = "") {
    recentChats.innerHTML = "";

    const filtered = conversations.filter(chat =>
        chat.title.toLowerCase().includes(searchText.toLowerCase())
    );

    recentCount.textContent = filtered.length;

    if (filtered.length === 0) {
        const empty = document.createElement("p");

        empty.className = "empty-history";
        empty.textContent = searchText
            ? "No matching chats found."
            : "Your conversations will appear here.";

        recentChats.appendChild(empty);
        return;
    }

    filtered.forEach(chat => {
        const button = document.createElement("button");

        button.className = "recent-chat-item";
        button.textContent = "◉  " + chat.title;
        button.title = chat.title;

        button.addEventListener("click", () => {
            openConversation(chat.id);
        });

        recentChats.appendChild(button);
    });
}

/* ------------------------------------------
   OPEN PREVIOUS CHAT
------------------------------------------ */

function openConversation(id) {
    const chat = conversations.find(item => item.id === id);

    if (!chat) return;

    currentChatId = chat.id;
    currentMessages = [...chat.messages];

    chatBox.innerHTML = "";

    currentMessages.forEach(message => {
        const element = document.createElement("div");

        element.className =
            "message " +
            (message.sender === "user"
                ? "user-message"
                : "bot-message");

        element.textContent = message.text;

        chatBox.appendChild(element);
    });

    welcomeSection.style.display = "none";

    closeSidebar();
    userInput.focus();
}

/* ------------------------------------------
   START NEW CHAT
------------------------------------------ */

function startNewChat() {
    currentChatId = null;
    currentMessages = [];
    selectedAttachments = [];

    chatBox.innerHTML = "";
    userInput.value = "";
    selectedFiles.innerHTML = "";

    imageInput.value = "";
    fileInput.value = "";

    welcomeSection.style.display = "flex";

    attachmentMenu.classList.remove("visible");

    closeSidebar();
    userInput.focus();
}

$("newChatButton").addEventListener("click", startNewChat);

/* ------------------------------------------
   SEND MESSAGE
------------------------------------------ */

function sendMessage() {
    const question = userInput.value.trim();

    if (!question && selectedAttachments.length === 0) {
        userInput.focus();
        return;
    }

    welcomeSection.style.display = "none";

    if (question) {
        addMessage(question, "user");
    }

    if (selectedAttachments.length > 0) {
        const names = selectedAttachments
            .map(file => file.name)
            .join(", ");

        addMessage("Attachments selected: " + names, "user");
    }

    userInput.value = "";
    selectedAttachments = [];
    selectedFiles.innerHTML = "";

    saveCurrentChat();

    /*
       TEMPORARY FRONTEND RESPONSE

       A real AI model will be connected
       through a secure backend later.
    */

    setTimeout(() => {
        addMessage(
            "Thank you for your question! Your message has been added to the conversation. The real Merit Nova AI assistant will be connected in the next development stage.",
            "bot"
        );

        saveCurrentChat();
    }, 700);

    userInput.focus();
}

chatForm.addEventListener("submit", event => {
    event.preventDefault();
    sendMessage();
});

/* ------------------------------------------
   SUBJECT SUGGESTION BUTTONS
------------------------------------------ */

document.querySelectorAll(".suggestion-card").forEach(button => {
    button.addEventListener("click", () => {
        const subject = button.querySelector("strong").textContent;

        userInput.value =
            "Help me learn " + subject +
            " with simple explanations and examples.";

        sendMessage();
    });
});

/* ------------------------------------------
   SIDEBAR MOBILE CONTROLS
------------------------------------------ */

function closeSidebar() {
    sidebar.classList.remove("open");
}

$("menuToggle").addEventListener("click", () => {
    sidebar.classList.toggle("open");
});

$("sidebarClose").addEventListener("click", closeSidebar);

/* ------------------------------------------
   SEARCH CHATS
------------------------------------------ */

const sidebarSearch = $("sidebarSearch");
const chatSearchInput = $("chatSearchInput");

$("searchChatsButton").addEventListener("click", () => {
    sidebarSearch.classList.toggle("visible");

    if (sidebarSearch.classList.contains("visible")) {
        chatSearchInput.focus();
    } else {
        chatSearchInput.value = "";
        renderRecentChats();
    }
});

chatSearchInput.addEventListener("input", () => {
    renderRecentChats(chatSearchInput.value);
});

/* ------------------------------------------
   ATTACHMENT MENU
------------------------------------------ */

$("attachButton").addEventListener("click", () => {
    attachmentMenu.classList.toggle("visible");
});

$("uploadImageButton").addEventListener("click", () => {
    imageInput.click();
    attachmentMenu.classList.remove("visible");
});

$("uploadFileButton").addEventListener("click", () => {
    fileInput.click();
    attachmentMenu.classList.remove("visible");
});

$("imageButton").addEventListener("click", () => {
    imageInput.click();
});

$("fileButton").addEventListener("click", () => {
    fileInput.click();
});

/* ------------------------------------------
   FILE SELECTION
------------------------------------------ */

function handleFileSelection(event) {
    const files = Array.from(event.target.files);

    files.forEach(file => {
        const exists = selectedAttachments.some(
            item => item.name === file.name &&
                    item.size === file.size
        );

        if (!exists) {
            selectedAttachments.push(file);
        }
    });

    selectedFiles.innerHTML = "";

    selectedAttachments.forEach(file => {
        const item = document.createElement("span");

        item.className = "selected-file";
        item.textContent = "📎 " + file.name;

        selectedFiles.appendChild(item);
    });

    if (files.length > 0) {
        showToast("File selected successfully.");
    }

    event.target.value = "";
}

imageInput.addEventListener("change", handleFileSelection);
fileInput.addEventListener("change", handleFileSelection);

/* ------------------------------------------
   MICROPHONE - SPEECH TO TEXT
------------------------------------------ */

const micButton = $("micButton");

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
        recording = true;
        micButton.classList.add("recording");
        micButton.textContent = "●";

        showToast("Listening... Speak now.");
    };

    recognition.onresult = event => {
        let transcript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }

        userInput.value = transcript;
    };

    recognition.onerror = event => {
        showToast("Microphone error: " + event.error);
    };

    recognition.onend = () => {
        recording = false;
        micButton.classList.remove("recording");
        micButton.textContent = "🎙";
    };

    function startRecording() {
        if (recording) return;

        try {
            recognition.start();
        } catch {
            showToast("Microphone is already starting.");
        }
    }

    function stopRecording() {
        if (recording) {
            recognition.stop();
        }
    }

    /* TAP TO START OR STOP */

    micButton.addEventListener("click", () => {
        if (recording) {
            stopRecording();
        } else {
            startRecording();
        }
    });

    /* HOLD TO TALK */

    micButton.addEventListener("pointerdown", event => {
        if (event.pointerType === "mouse") return;
        startRecording();
    });

    micButton.addEventListener("pointerup", event => {
        if (event.pointerType === "mouse") return;
        stopRecording();
    });

    micButton.addEventListener("pointercancel", stopRecording);
    micButton.addEventListener("lostpointercapture", stopRecording);

} else {
    micButton.addEventListener("click", () => {
        showToast(
            "Voice input is not supported in this browser. Try Chrome."
        );
    });
}

/* ------------------------------------------
   DARK AND LIGHT THEME
------------------------------------------ */

$("themeButton").addEventListener("click", function () {
    document.body.classList.toggle("dark-theme");

    this.textContent =
        document.body.classList.contains("dark-theme")
            ? "☀"
            : "☾";
});

/* ------------------------------------------
   OTHER SIDEBAR OPTIONS
------------------------------------------ */

$("scheduledButton").addEventListener("click", () => {
    showToast("Scheduled tasks will be added in a future update.");
});

$("libraryButton").addEventListener("click", () => {
    showToast("Your learning library is coming soon.");
});

$("meetingSummaryButton").addEventListener("click", () => {
    showToast("Meeting Summary will be developed next.");
});

$("settingsButton").addEventListener("click", () => {
    showToast("Workspace settings are coming soon.");
});

/* ------------------------------------------
   INITIALIZE WORKSPACE
------------------------------------------ */

renderRecentChats();
