import React, { useEffect, useState } from 'react';
import { Table, Pagination, Button } from 'react-bootstrap';
import sendRefreshTokenAndStoreAccessToken from "../auth/RefreshAccessToken";
import {useNavigate} from "react-router-dom";
import {apiClient} from "../apiClient"; // React-Bootstrap 사용

const MemberList = () => {
    const navigate = useNavigate(); // useNavigate 훅 사용
    const [members, setMembers] = useState([]); // 회원 목록을 저장할 상태
    const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수를 저장할 상태
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지를 저장할 상태
    const [error, setError] = useState(''); // 오류 메시지를 저장할 상태

    useEffect(() => {
        // 회원 데이터 가져오는 함수
        const fetchMembers = async (page) => {
            try {
                const token = localStorage.getItem('token'); // 토큰 가져오기
                const response = await apiClient.get(`/admin/member?page=${page}`, {
                    headers: {
                        Authorization: `Bearer ${token}`, // 토큰을 Authorization 헤더에 포함
                    },
                });

                setMembers(response.data.memberList); // 회원 목록 저장
                setTotalPages(response.data.totalPages); // 전체 페이지 수 저장
            } catch (error) {
                try{
                    await sendRefreshTokenAndStoreAccessToken();
                    const token = localStorage.getItem('token'); // 토큰 가져오기
                    const response = await apiClient.get(`/admin/member?page=${page}`, {
                        headers: {
                            Authorization: `Bearer ${token}`, // 토큰을 Authorization 헤더에 포함
                        },
                    });

                    setMembers(response.data.memberList); // 회원 목록 저장
                    setTotalPages(response.data.totalPages); // 전체 페이지 수 저장

                } catch (error) {
                    console.error('API 요청 실패:', error.status);
                    if (error.status === 401) {
                        setError('회원 목록을 불러오는 데 실패했습니다. - 권한 없음');
                    } else {
                        setError('회원 목록을 불러오는 데 실패했습니다.');
                    }
                }
            }
        };

        fetchMembers(currentPage); // 페이지 로드 시 회원 목록 불러오기
    }, [currentPage]); // currentPage가 변경될 때마다 다시 요청

    // 페이지 변경 시 호출되는 함수
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber); // 페이지 번호 변경
    };

    // 회원 삭제 요청 처리 함수
    const handleDeleteMember = async (memberId) => {
        try {
            const confirmDelete = window.confirm('회원탈퇴 시키시겠습니까?');
            if (!confirmDelete) {
                return;
            }
            
            const token = localStorage.getItem('token'); // 토큰 가져오기
            await apiClient.delete(`/admin/member/${memberId}`, {
                headers: {
                    Authorization: `Bearer ${token}`, // 토큰을 Authorization 헤더에 포함
                },
            });
            // 삭제 후 회원 목록 갱신 (현재 페이지 다시 로드)
            setMembers(members.filter((member) => member.id !== memberId));
        } catch (error) {
            try{ // 토큰 재발급
                await sendRefreshTokenAndStoreAccessToken();

                const token = localStorage.getItem('token'); // 토큰 가져오기
                await apiClient.delete(`/admin/member/${memberId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`, // 토큰을 Authorization 헤더에 포함
                    },
                });
                // 삭제 후 회원 목록 갱신 (현재 페이지 다시 로드)
                setMembers(members.filter((member) => member.id !== memberId));
            } catch (error) {
                setError('회원 삭제에 실패했습니다.');
                console.error('회원 삭제 실패:', error);
            }
        }
    };

    const handleDeleteMembersClick = () => {
        navigate('/admin/member/delete'); // 버튼 클릭 시 해당 경로로 이동
    };

    return (
        <div className="container mt-5">
            <div className="container mt-5">
                <h2 className="text-center mb-4">회원 목록</h2>
            </div>
            <div className="container mt-5 mb-2 d-flex justify-content-end">
                <button
                    className="btn btn-info"
                    onClick={handleDeleteMembersClick}
                >
                    탈퇴회원목록
                </button>
            </div>


            {error && <p className="text-danger text-center">{error}</p>}

            {/* 회원 목록 표 */}
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>#</th>
                    <th>이메일</th>
                    <th>이름</th>
                    <th>전화번호</th>
                    <th>가입일자</th>
                    <th>작업</th>
                    {/* 작업 열 추가 */}
                </tr>
                </thead>
                <tbody>
                {members.length > 0 ? (
                    members.map((member, index) => (
                        <tr key={member.id}>
                            <td>{member.id}</td>
                            {/* 각 페이지에서 번호 계산 */}
                            <td>{member.email}</td>
                            <td>{member.userName}</td>
                            <td>{member.phone}</td>
                            <td>{new Date(member.createdAt).toLocaleDateString('ko-KR')}</td>
                            <td>
                                {/* 삭제 버튼 추가 */}
                                <Button
                                    variant="danger"
                                    onClick={() => handleDeleteMember(member.id)} // 삭제 클릭 시 함수 호출
                                >
                                    탈퇴
                                </Button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="5" className="text-center">

                        </td>
                    </tr>
                )}
                </tbody>
            </Table>

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
        </div>
    );
};

export default MemberList;
