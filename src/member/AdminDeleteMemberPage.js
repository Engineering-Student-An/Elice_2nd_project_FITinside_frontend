import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pagination } from 'react-bootstrap';
import sendRefreshTokenAndStoreAccessToken from "../auth/RefreshAccessToken";

const DeletedMembersList = () => {
    const [deletedMembers, setDeletedMembers] = useState([]); // 탈퇴회원 목록 상태
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
    const [totalPages, setTotalPages] = useState(0); // 총 페이지 수
    const [error, setError] = useState(''); // 에러 상태

    useEffect(() => {
        const fetchDeletedMembers = async () => {
            try {
                const token = localStorage.getItem('token'); // 로컬 스토리지에서 토큰 가져오기
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_PROXY}/api/admin/member/delete`, {
                    headers: {
                        Authorization: `Bearer ${token}`, // Authorization 헤더에 토큰 추가
                    },
                });

                setDeletedMembers(response.data.memberList); // 탈퇴회원 목록 상태 업데이트
                setTotalPages(response.data.totalPages); // 전체 페이지 수 저장
            } catch (error) {
                try{ // 토큰 재발급
                    await sendRefreshTokenAndStoreAccessToken();

                    const token = localStorage.getItem('token'); // 로컬 스토리지에서 토큰 가져오기
                    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_PROXY}/api/admin/member/delete`, {
                        headers: {
                            Authorization: `Bearer ${token}`, // Authorization 헤더에 토큰 추가
                        },
                    });

                    setDeletedMembers(response.data.memberList); // 탈퇴회원 목록 상태 업데이트
                    setTotalPages(response.data.totalPages); // 전체 페이지 수 저장
                } catch (error) {
                    setError('탈퇴회원 목록을 가져오는 데 실패했습니다.'); // 에러 상태 업데이트
                }
            }
        };

        fetchDeletedMembers(); // 회원 목록 가져오기
    }, []); // 컴포넌트가 처음 렌더링될 때 한 번만 실행

    const handlePageChange = (page) => {
        setCurrentPage(page); // 페이지 변경
    };

    return (
        <div className="container mt-5">
            <h2>탈퇴회원 목록</h2>
            {error && <p className="text-danger">{error}</p>}
            {deletedMembers.length > 0 ? (
                <>
                    <table className="table">
                        <thead>
                        <tr>
                            <th>이메일</th>
                            <th>이름</th>
                            <th>전화번호</th>
                        </tr>
                        </thead>
                        <tbody>
                        {deletedMembers.map((member, index) => (
                            <tr key={index}>
                                <td>{member.email}</td>
                                <td>{member.userName}</td>
                                <td>{member.phone}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {/* 페이지네이션 */}
                    <Pagination className="justify-content-center">
                        {[...Array(totalPages)].map((_, index) => (
                            <Pagination.Item
                                key={index}
                                active={index + 1 === currentPage}
                                onClick={() => handlePageChange(index + 1)}
                            >
                                {index + 1}
                            </Pagination.Item>
                        ))}
                    </Pagination>
                </>
            ) : (
                <p>탈퇴회원이 없습니다.</p>
            )}
        </div>
    );
};

export default DeletedMembersList;
