class User {
    constructor(id, name, email, age) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.age = age;
        this.createdAt = new Date().toISOString();
    }
}

class UserService {
    constructor(storageKey = "users") {
        this.storageKey = storageKey;
        this.apiUrl = "/.netlify/functions";
    }

    getUsers() {
        return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    }

    addUser(name, email, age) {
        let users = this.getUsers();
        let id = users.length ? users[users.length - 1].id + 1 : 1;
        let user = new User(id, name, email, age);
        users.push(user);
        localStorage.setItem(this.storageKey, JSON.stringify(users));

        // Đồng bộ lên MongoDB
        this.syncToMongoDB(users);
        this.renderUsers();
    }

    async syncToMongoDB(users) {
        try {
            await fetch(`${this.apiUrl}/saveData`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(users),
            });
            console.log("Đã đồng bộ lên MongoDB!");
        } catch (error) {
            console.error("Lỗi khi đồng bộ lên MongoDB:", error);
        }
    }

    async syncFromMongoDB() {
        try {
            const response = await fetch(`${this.apiUrl}/getData`);
            const users = await response.json();
            localStorage.setItem(this.storageKey, JSON.stringify(users));
            console.log("Đã đồng bộ từ MongoDB:", users);
            this.renderUsers();
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu từ MongoDB:", error);
        }
    }

    renderUsers() {
        const userList = document.getElementById("userList");
        userList.innerHTML = "";
        this.getUsers().forEach(user => {
            let li = document.createElement("li");
            li.textContent = `${user.name} - ${user.email} - ${user.age}`;
            userList.appendChild(li);
        });
    }
}

const userService = new UserService();

// 🟢 Đồng bộ từ MongoDB khi mở trang
window.onload = () => {
    userService.syncFromMongoDB();
    userService.renderUsers();
};

// 🟢 Hàm thêm user từ giao diện
function addUser() {
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let age = document.getElementById("age").value;
    if (name && email && age) {
        userService.addUser(name, email, parseInt(age));
    }
}

// 🟢 Đồng bộ từ MongoDB
function syncFromMongoDB() {
    userService.syncFromMongoDB();
}
