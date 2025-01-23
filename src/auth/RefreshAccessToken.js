// refreshToken을 JSON으로 보내고 accessToken을 로컬 스토리지에 저장하는 함수
import axios from "axios";


const sendRefreshTokenAndStoreAccessToken = async () => {
    try {
        // refreshToken을 /api/auth/token으로 JSON 형식으로 전송
        const response = await axios.post(
            '/api/auth/token',
            { }, // refreshToken을 요청 바디에 포함
            {
                headers: {
                    'Content-Type': 'application/json', // 요청 헤더 설정
                },
                withCredentials: true, // 쿠키 기반 인증 사용 (httponly 쿠키를 같이 보냄)
            }
        );

        const accessToken = response.data.accessToken; // 서버에서 새로운 accessToken 받기
        localStorage.setItem('token', accessToken); // accessToken을 로컬 스토리지에 저장
        console.log('새로운 accessToken이 로컬 스토리지에 저장되었습니다.');
    } catch (error) {
        console.error('토큰 갱신 실패:', error);
    }
};

// // 쿠키에서 특정 쿠키 값을 가져오는 함수
// const getCookie = (name) => {
//     const value = `; ${document.cookie}`;
//     const parts = value.split(`; ${name}=`);
//     if (parts.length === 2) return parts.pop().split(';').shift();
// };

export default sendRefreshTokenAndStoreAccessToken;