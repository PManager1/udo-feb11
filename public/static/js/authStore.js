// static/js/authStore.js



// static/js/authStore.js
const useAuthStore = window.zustand.create((set) => ({
    isLoggedIn: !!localStorage.getItem('jwt'),
    user: JSON.parse(localStorage.getItem('user')) || null,
    login: (token, user) => {
        set({ isLoggedIn: true, user });
        localStorage.setItem('jwt', token);
        localStorage.setItem('user', JSON.stringify(user));
    },
    logout: () => {
        set({ isLoggedIn: false, user: null });
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
    },
}));
