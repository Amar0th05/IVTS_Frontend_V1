function getBaseUrl() {
    const { hostname } = location;
    const environments = {
      dev: { host: "localhost", baseUrl: "http://localhost:5500" },
      prod: { host: "ntcpwcit.in", baseUrl: "https://ntcpwcit.in/worksphere/api" } 
    };
  
    for (let env in environments) {
      if (environments[env].host == hostname) {
        return environments[env].baseUrl;
      }
    }
  
    return "http://localhost:5500"; 
  }
  


const BASE_URL = getBaseUrl();

const axiosInstance = axios.create({
    baseURL: BASE_URL,
});

let isLoggingOut = false;

axiosInstance.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');

        if (!config.url.includes('auth')&&!config.url.includes('password')) {
            if (isTokenExpired()) {
                handleSessionExpiry();
                return Promise.reject(new Error('Session expired. Please login again.'));
            }
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const errorMessage = error.response?.data?.message || '';

            if (errorMessage.toLowerCase().includes('invalid') || errorMessage.toLowerCase().includes('wrong')||errorMessage.toLowerCase().includes('active')) {
                return Promise.reject(error);
            }

            handleSessionExpiry();
        }
        return Promise.reject(error);
    }
);


function handleSessionExpiry() {
    if (!isLoggingOut) {
        isLoggingOut = true;
        showErrorPopupFadeInDown('Session expired. Please login again.');
        setTimeout(logout, 1500);
    }
}

function logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = 'login.html';
}

function isTokenExpired() {
    const token = sessionStorage.getItem('token');
    if (!token) return true;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch (error) {
        return true;
    }
}


if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('signup.html')&&!window.location.pathname.includes('forgot-password.html')&&!window.location.pathname.includes('reset-password.html')) {
    setInterval(() => {
        if (isTokenExpired()) {
            handleSessionExpiry();
        }
    }, 10000);
}

window.logout = logout;
window.axiosInstance = axiosInstance;
