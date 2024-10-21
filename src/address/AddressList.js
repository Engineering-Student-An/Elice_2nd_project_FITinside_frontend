import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import sendRefreshTokenAndStoreAccessToken from "../auth/RefreshAccessToken";
import DeliveryForm from '../order/DeliveryForm';

const AddressList = () => {
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null); // 수정할 주소
    const [isEditing, setIsEditing] = useState(false); // 수정 모드 여부
    const [isAdding, setIsAdding] = useState(false); // 추가 모드 여부
    const formRef = useRef(null); // DeliveryForm의 ref
    const [error, setError] = useState(null);
    const MAX_ADDRESSES = 5; // 배송지 최대 개수

    const fetchAddresses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/addresses', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setAddresses(response.data);  // API 응답으로 받은 주소 데이터 저장
        } catch (err) {
            try {
                await sendRefreshTokenAndStoreAccessToken();
                window.location.reload(); // 새로고침
            } catch (error) {
                setError(error.message);
            }
        }
    };

    useEffect(() => {
        fetchAddresses();  // 컴포넌트가 마운트될 때 주소 데이터를 가져옴
    }, []);

    const handleEdit = (addressId) => {
        const addressToEdit = addresses.find(address => address.addressId === addressId);
        setSelectedAddress(addressToEdit); // 수정할 주소 설정
        setIsEditing(true); // 수정 모드 활성화

        setTimeout(() => {
                    if (formRef.current) {
                        console.log('시간 지연 후 formRef 확인: ', formRef);
                        formRef.current.setIsReadOnly(false);
                        //폼에 기본 배송지인지 확인해서 값 전달해주기
                        const isDefault= addressToEdit.defaultAddress === 'Y' ? true : false;
                        formRef.current.setIsDefaultAddress(isDefault);
            }
        }, 0); // 0ms라도 렌더링 후에 실행되도록 지연
    };

    // 수정 또는 추가 저장 시 호출되는 함수
    const handleSave = async () => {
        const formData = formRef.current.getFormData(); // 폼의 데이터 가져오기

        // 유효성 검사
        if (!formData) {
            alert('배송 정보를 입력해주세요.');
            return;
        }

        const dataToSend = {
            ...formData,
            defaultAddress: formData.saveAsDefault ? 'Y' : 'N'
        }

        console.log('서버로 보낼 데이터: ', JSON.stringify(dataToSend, null, 2));


        const token = localStorage.getItem('token');

        if (isAdding) {
            // 배송지 추가 로직
            try {
                const response = await axios.post('http://localhost:8080/api/addresses', dataToSend, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                alert('배송지가 추가되었습니다.');
                setIsAdding(false); // 추가 모드 비활성화
                fetchAddresses(); // 추가 후 목록 갱신
                setSelectedAddress(null); // 선택된 주소 초기화
            } catch (error) {
                console.error('배송지 추가 실패: ', error);
                alert('배송지 추가 중 오류가 발생했습니다.');
            }
        } else if (isEditing) {
            // 배송지 수정 로직
            try {
                const response = await axios.patch(`http://localhost:8080/api/addresses/${selectedAddress.addressId}`, dataToSend, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                alert('배송지가 수정되었습니다.');
                setIsEditing(false); // 수정 모드 비활성화
                fetchAddresses(); // 수정 후 목록 갱신
                setSelectedAddress(null); // 선택된 주소 초기화 (필요 시)
            } catch (error) {
                console.error('수정 실패: ', error);
                alert('배송 정보를 입력해주세요.');
            }
        }
    };

    // 수정/추가 취소
    const handleCancel = () => {
        setIsEditing(false); // 수정 모드 비활성화
        setIsAdding(false); // 추가 모드 비활성화
        setSelectedAddress(null); // 선택된 주소 초기화
    };

    const handleDelete = async (addressId) => {
        const addressToDelete = addresses.find(address => address.addressId === addressId);
        console.log('삭제할 배송지의 기본 배송지 정보: ', JSON.stringify(addressToDelete, null, 2));
        if(addressToDelete && addressToDelete.defaultAddress === 'Y'){
            alert('기본 배송지는 삭제할 수 없습니다. 수정 후 진행해주세요.');
            return;
        }

        const confirmDelete = window.confirm("배송지를 삭제하시겠습니까?");
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/api/addresses/${addressId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setAddresses(addresses.filter(address => address.addressId !== addressId)); // 삭제 후 목록 갱신
            alert('배송지가 삭제되었습니다.');
        } catch (err) {
            console.error("배송지 삭제 중 오류 발생: ", err);
            alert('배송지 삭제 중 오류가 발생했습니다.');
        }
    };

    const handleAdd = () => {
        setSelectedAddress(null); // 추가는 빈 폼으로 진행
        setIsAdding(true); // 추가 모드 활성화
        setIsEditing(false); // 수정 모드 비활성화

        setTimeout(() => {
            if (formRef.current) {
                console.log('시간 지연 후 formRef 확인: ', formRef);
                formRef.current.setIsReadOnly(false);
                formRef.current.setIsDefaultAddress(false);
            }
        }, 0); // 0ms라도 렌더링 후에 실행되도록 지연
    };

    // 기본 배송지로 설정하는 함수
    const handleDefaultChange = async (addressId, isChecked) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:8080/api/addresses/${addressId}/default`, null, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    isDefault: isChecked? "Y" : "N"  // 기본 배송지로 설정
                }
            });
            alert(`기본 배송지가 ${isChecked ? '설정' : '해제'}되었습니다.`);
            fetchAddresses();  // 변경 후 목록 갱신
        } catch (error) {
            console.error('기본 배송지 설정 중 오류 발생: ', error);
            alert('기본 배송지 설정 중 오류가 발생했습니다.');
        }
    };

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    return (
        <div className="container mt-5">
            <h2 className="mb-4">배송지 목록</h2>
            {!isEditing && !isAdding ? (
                <>
                    {/* 배송지가 5개 이상이면 추가 버튼 비활성화 */}
                    <button
                        className="btn btn-primary mb-3"
                        onClick={handleAdd}
                        disabled={addresses.length >= MAX_ADDRESSES}
                    >
                        새 배송지 추가
                    </button>
                    {addresses.length >= MAX_ADDRESSES && (
                        <p className="text-danger">최대 {MAX_ADDRESSES}개의 배송지만 저장할 수 있습니다.</p>
                    )}
                    {addresses.length > 0 ? (
                        <table className="table table-bordered">
                            <thead>
                            <tr>
                                <th>기본 배송지</th>
                                <th>수령인</th>
                                <th>전화번호</th>
                                <th>우편번호</th>
                                <th>주소</th>
                                <th>상세주소</th>
                                <th>배송 메모</th>
                                <th>관리</th>
                            </tr>
                            </thead>
                            <tbody>
                            {addresses.map(address => (
                                <tr key={address.addressId}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={address.defaultAddress === 'Y'} // 기본 배송지 체크 (defaultAddress가 Y일 경우 체크)
                                            onChange={(e) => handleDefaultChange(address.addressId, e.target.checked)}
                                        />
                                    </td>
                                    <td>{address.deliveryReceiver}</td>
                                    <td>{address.deliveryPhone}</td>
                                    <td>{address.postalCode}</td>
                                    <td>{address.deliveryAddress}</td>
                                    <td>{address.detailedAddress}</td>
                                    <td>{address.deliveryMemo}</td>
                                    <td>
                                        <button
                                            className="btn btn-warning btn-sm me-2"
                                            onClick={() => handleEdit(address.addressId)}
                                        >
                                            수정
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(address.addressId)}
                                        >
                                            삭제
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <div>등록된 배송지가 없습니다.</div>
                    )}
                </>
            ) : (
                <div>
                    <h3>{isAdding ? "새 배송지 추가" : "배송지 수정"}</h3>
                    <DeliveryForm
                        ref={formRef}
                        initialValues={selectedAddress || {}}  // selectedAddress가 null이면 빈 객체 전달
                        // showDefaultSelect={true}  // 추가 및 수정 모드일 때 기본 배송지 선택 버튼을 숨김
                        hideButtons={true}
                        forceShowCheckbox={true}
                    />
                    <button className="btn btn-success mt-3" onClick={handleSave}>저장</button>
                    <button className="btn btn-secondary mt-3 ms-2" onClick={handleCancel}>취소</button>
                </div>
            )}
        </div>
    );
};

export default AddressList;
