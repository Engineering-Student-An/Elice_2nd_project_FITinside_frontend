import axios from 'axios';

// API 클라이언트 생성
export const apiClient = axios.create({
    baseURL: 'api',  // baseURL은 '/'로 시작해야 합니다.
});