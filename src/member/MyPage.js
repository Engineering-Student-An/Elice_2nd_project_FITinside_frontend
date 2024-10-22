import React, {useContext, useEffect, useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import sendRefreshTokenAndStoreAccessToken from "../auth/RefreshAccessToken";
import {UrlConstantContext} from "../UrlConstant";

const MyPage = () => {
    const [userInfo, setUserInfo] = useState(null); // 사용자 정보를 저장할 상태
    const [error, setError] = useState(''); // 에러 상태
    const [isEditingName, setIsEditingName] = useState(false); // 이름 수정 모드
    const [isEditingPhone, setIsEditingPhone] = useState(false); // 전화번호 수정 모드
    const [newName, setNewName] = useState(''); // 수정된 이름 상태
    const [newPhone, setNewPhone] = useState(''); // 수정된 전화번호 상태
    const URL = useContext(UrlConstantContext)

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token'); // 로컬 스토리지에서 토큰 가져오기

                const response = await axios.get('https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/user/me', {
                    headers: {
                        Authorization: `Bearer ${token}`, // Authorization 헤더에 토큰 추가
                    },
                });

                setUserInfo(response.data); // 사용자 정보를 상태에 저장
                setNewName(response.data.userName); // 기본 이름 설정
                setNewPhone(response.data.phone); // 기본 전화번호 설정
            } catch (err) {
                try {
                    await sendRefreshTokenAndStoreAccessToken();
                    const token = localStorage.getItem('token'); // 로컬 스토리지에서 토큰 가져오기

                    const response = await axios.get(URL + '/api/user/me', {
                        headers: {
                            Authorization: `Bearer ${token}`, // Authorization 헤더에 토큰 추가
                        },
                    });

                    setUserInfo(response.data); // 사용자 정보를 상태에 저장
                    setNewName(response.data.userName); // 기본 이름 설정
                    setNewPhone(response.data.phone); // 기본 전화번호 설정
                } catch (error) {
                    setError('사용자 정보를 가져오는 데 실패했습니다.');
                }

            }
        };

        fetchUserData(); // 사용자 데이터 가져오기
    }, []); // 컴포넌트가 처음 렌더링될 때 한 번만 실행

    const navigate = useNavigate(); // useNavigate 훅 사용

    const handleCouponManagementClick = () => {
        navigate('/coupons'); // 쿠폰 관리 페이지로 이동
    };

    const handleEditNameClick = () => {
        setIsEditingName(true); // 이름 수정 모드 활성화
    };

    const handleEditPhoneClick = () => {
        setIsEditingPhone(true); // 전화번호 수정 모드 활성화
    };

    const handleSaveName = async () => {
        try {
            // 기존 이름과 입력한 이름이 같으면 서버 요청 없이 수정 모드 종료
            if (userInfo.userName === newName) {
                setIsEditingName(false); // 수정 모드 종료
                return; // 더 이상 실행하지 않고 함수 종료
            }

            const token = localStorage.getItem('token');
            await axios.put(
                'https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/user/username', // 이름 수정 API 엔드포인트
                { userName: newName },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 서버로부터 성공적으로 이름이 수정되었으면 상태 업데이트
            setUserInfo((prevInfo) => ({ ...prevInfo, userName: newName })); // 상태 업데이트
            setIsEditingName(false); // 수정 모드 종료
        } catch (error) {
            setError('이름 수정에 실패했습니다.');
        }
    };

    const handleOrderManagementClick = () => {
        navigate('/orders'); // 주문 목록 페이지로 이동
    };

    const handleAddressManagementClick = () => {
        navigate('/addresses'); // 주문 목록 페이지로 이동
    };


    const handleSavePhone = async () => {
        try {
            if (userInfo.phone === newPhone) {
                setIsEditingPhone(false); // 수정 모드 종료
                return; // 더 이상 실행하지 않고 함수 종료
            }

            const token = localStorage.getItem('token');
            await axios.put(
                'https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/user/phone', // 전화번호 수정 API 엔드포인트
                { phone: newPhone },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUserInfo((prevInfo) => ({ ...prevInfo, phone: newPhone })); // 상태 업데이트
            setIsEditingPhone(false); // 수정 모드 종료
        } catch (error) {
            setError('전화번호 수정에 실패했습니다.');
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">내 정보</h2>
            {error && <p className="text-danger text-center">{error}</p>}
            {userInfo ? (
                <div className="card p-4">
                    <div className="mb-3" style={{border: '1px solid #ddd', borderRadius: '8px', padding: '10px'}}>
                        <h5>이메일</h5>
                        <p>{userInfo.email}</p>
                    </div>

                    {/* 이름 수정 */}
                    <div className="mb-3" style={{
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h5>이름</h5>
                            {isEditingName ? (
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                            ) : (
                                <p>{userInfo.userName}</p>
                            )}
                        </div>
                        <div>
                            {isEditingName ? (
                                <button
                                    style={{
                                        backgroundColor: '#87CEEB',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                    }}
                                    onClick={handleSaveName}
                                >
                                    확인
                                </button>
                            ) : (
                                <button
                                    style={{
                                        backgroundColor: '#87CEEB',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                    }}
                                    onClick={handleEditNameClick}
                                >
                                    수정
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 전화번호 수정 */}
                    <div className="mb-3" style={{
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h5>전화번호</h5>
                            {isEditingPhone ? (
                                <input
                                    type="text"
                                    value={newPhone}
                                    onChange={(e) => setNewPhone(e.target.value)}
                                />
                            ) : (
                                <p>{userInfo.phone}</p>
                            )}
                        </div>
                        <div>
                            {isEditingPhone ? (
                                <button
                                    style={{
                                        backgroundColor: '#87CEEB',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                    }}
                                    onClick={handleSavePhone}
                                >
                                    확인
                                </button>
                            ) : (
                                <button
                                    style={{
                                        backgroundColor: '#87CEEB',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                    }}
                                    onClick={handleEditPhoneClick}
                                >
                                    수정
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 내 쿠폰 관리 */}
                    <div className="mb-3" style={{border: '1px solid #ddd', borderRadius: '8px', padding: '10px'}}>
                        <h5>쿠폰</h5>
                        <button className="btn btn-light text-dark mb-4" style={{border: '1px solid #ced4da'}}
                                onClick={handleCouponManagementClick}>
                            쿠폰 관리하기
                        </button>
                    </div>

                    {/* 내 주문 확인 */}
                    <div className="mb-3" style={{border: '1px solid #ddd', borderRadius: '8px', padding: '10px'}}>
                        <h5>주문</h5>
                        <button className="btn btn-light text-dark mb-4" style={{border: '1px solid #ced4da'}}
                                onClick={handleOrderManagementClick}>
                            주문 확인하기
                        </button>
                    </div>

                    {/* 내 배송지 확인 */}
                    <div className="mb-3" style={{border: '1px solid #ddd', borderRadius: '8px', padding: '10px'}}>
                        <h5>배송지</h5>
                        <button className="btn btn-light text-dark mb-4" style={{border: '1px solid #ced4da'}}
                                onClick={handleAddressManagementClick}>
                            배송지 관리하기
                        </button>
                    </div>

                </div>
            ) : (
                <p className="text-center">로딩 중...</p>
            )}
        </div>
    );
};

export default MyPage;
