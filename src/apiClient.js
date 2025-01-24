import axios from 'axios';

const host = window.location.hostname === "localhost"
    ? `http://ec2-13-209-198-107.ap-northeast-2.compute.amazonaws.com:8080/api`
    : "api";


// API 클라이언트 생성
export const apiClient = axios.create({
    baseURL: host,
});