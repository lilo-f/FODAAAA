class UserSession {
   constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('ravenStudioCurrentUser')) || null;
        this.init();
    }
    init() {
        this.updateNavbar();
        this.updateGameNavbar(); // Adicione esta linha
    }




    login(userData) {
        // Carrega os dados completos do usuário do banco de dados local
        const users = JSON.parse(localStorage.getItem('ravenStudioUsers')) || [];
        const completeUser = users.find(u => u.email === userData.email) || userData;
        
        // Garante que os arrays existam
        completeUser.orders = completeUser.orders || [];
        completeUser.wishlist = completeUser.wishlist || [];
        
        this.currentUser = completeUser;
        localStorage.setItem('ravenStudioCurrentUser', JSON.stringify(completeUser));
        this.updateNavbar();
        this.showNotification('Login realizado com sucesso!');
        return completeUser;
    }



    
    // Adicione este novo método
    updateGameNavbar() {
        const gameUserLink = document.getElementById('gameUserLink');
        const gameUserAvatar = document.getElementById('gameUserAvatar');
        const gameUserIcon = document.getElementById('gameUserIcon');

        if (gameUserLink && gameUserAvatar && gameUserIcon) {
            if (this.isLoggedIn()) {
                if (this.currentUser.avatar) {
                    gameUserAvatar.src = this.currentUser.avatar;
                    gameUserAvatar.style.display = 'block';
                    gameUserIcon.style.display = 'none';
                } else {
                    gameUserAvatar.style.display = 'none';
                    gameUserIcon.style.display = 'block';
                }
                gameUserLink.href = '/pages/user.html';
            } else {
                gameUserAvatar.style.display = 'none';
                gameUserIcon.style.display = 'block';
                gameUserLink.href = '/pages/login.html';
            }
        }
    }

    addToWishlist(productId) {
        if (!this.currentUser) return false;
        
        const users = JSON.parse(localStorage.getItem('ravenStudioUsers')) || [];
        const userIndex = users.findIndex(u => u.email === this.currentUser.email);
        
        if (userIndex !== -1) {
            if (!users[userIndex].wishlist) {
                users[userIndex].wishlist = [];
            }
            
            if (!users[userIndex].wishlist.includes(productId)) {
                users[userIndex].wishlist.push(productId);
                localStorage.setItem('ravenStudioUsers', JSON.stringify(users));
                
                // Atualiza o usuário atual
                this.currentUser.wishlist = users[userIndex].wishlist;
                localStorage.setItem('ravenStudioCurrentUser', JSON.stringify(this.currentUser));
                return true;
            }
        }
        return false;
    }
    logout() {
        this.currentUser = null;
        localStorage.removeItem('ravenStudioCurrentUser');
        this.updateNavbar();
        window.location.href = '/pages/login.html';
    }

    updateNavbar() {
        const navUser = document.querySelector('.nav-icons a[href="/pages/login.html"]');
        if (!navUser) return;

        if (this.currentUser) {
            navUser.href = '/pages/user.html';
            navUser.innerHTML = this.currentUser.avatar 
                ? `<img src="${this.currentUser.avatar}" alt="Avatar" style="width: 20px; height: 20px; border-radius: 50%;">`
                : `<i class="fas fa-user"></i>`;
        } else {
            navUser.href = '/pages/login.html';
            navUser.innerHTML = '<i class="fas fa-user"></i>';
        }
    }

    loadUserData() {
        if (!this.currentUser) return;

        if (document.getElementById('user-avatar')) {
            const avatarImg = document.getElementById('user-avatar');
            const defaultIcon = document.getElementById('default-avatar-icon');
            
            if (this.currentUser.avatar) {
                avatarImg.src = this.currentUser.avatar;
                avatarImg.style.display = 'block';
                defaultIcon.style.display = 'none';
            } else {
                avatarImg.style.display = 'none';
                defaultIcon.style.display = 'flex';
            }
        }
    }



    removeFromWishlist(productId) {
        if (!this.currentUser || !this.currentUser.wishlist) return false;
        
        const index = this.currentUser.wishlist.indexOf(productId);
        if (index > -1) {
            this.currentUser.wishlist.splice(index, 1);
            localStorage.setItem('ravenStudioCurrentUser', JSON.stringify(this.currentUser));
            return true;
        }
        return false;
    }

    getWishlist() {
        return this.currentUser?.wishlist || [];
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #3b82f6, #22c55e);
            color: #000;
            padding: 1rem 2rem;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            font-family: 'Bebas Neue', cursive;
            font-size: 1.2rem;
            animation: slideIn 0.3s ease-out;
        `;
        notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.userSession = new UserSession();
    
    // Verifica se o usuário está logado ao carregar a página
    if (!window.userSession.isLoggedIn() && window.location.pathname.includes('user.html')) {
        window.location.href = 'login.html';
    }
});
