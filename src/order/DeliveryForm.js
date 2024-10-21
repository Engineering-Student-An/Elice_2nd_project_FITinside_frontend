import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import './deliveryForm.css';
import PostcodeSearch from "./PostcodeSearch";

const DeliveryForm = forwardRef(({ initialValues = {}, onAddressSelect, showDefaultSelect = true }, ref) => {
    const [postalCode, setPostalCode] = useState(initialValues.postalCode || '');
    const [deliveryAddress, setDeliveryAddress] = useState(initialValues.deliveryAddress || '');
    const [detailedAddress, setDetailedAddress] = useState(initialValues.detailedAddress || '');
    const [deliveryReceiver, setDeliveryReceiver] = useState(initialValues.deliveryReceiver || '');
    const [deliveryMemo, setDeliveryMemo] = useState(initialValues.deliveryMemo || '');
    const [phoneFirst, setPhoneFirst] = useState('010');
    const [phoneMiddle, setPhoneMiddle] = useState('');
    const [phoneLast, setPhoneLast] = useState('');

    // 에러 메시지 상태 관리
    const [errors, setErrors] = useState({
        deliveryReceiver: '',
        phone: '',
        postalCode: '',
        deliveryAddress: ''
    });

    // 유효성 검사 함수
    const validateForm = () => {
        let formIsValid = true;
        const newErrors = {
            deliveryReceiver: '',
            phone: '',
            postalCode: '',
            deliveryAddress: ''
        };

        if (!deliveryReceiver.trim()) {
            newErrors.deliveryReceiver = '수령인을 입력해주세요.';
            formIsValid = false;
        }

        if (!phoneMiddle.trim() || !phoneLast.trim()) {
            newErrors.phone = '연락처를 입력해주세요.';
            formIsValid = false;
        }

        if (!postalCode.trim()) {
            newErrors.postalCode = '우편번호를 입력해주세요.';
            formIsValid = false;
        }

        if (!deliveryAddress.trim()) {
            newErrors.deliveryAddress = '주소를 입력해주세요.';
            formIsValid = false;
        }

        setErrors(newErrors);
        return formIsValid;
    };

    useEffect(() => {
        // 초기값을 설정하기 위한 useEffect: 컴포넌트가 처음 렌더링될 때만 초기값을 설정
        if (initialValues) {
            setPostalCode(initialValues.postalCode || '');
            setDeliveryAddress(initialValues.deliveryAddress || '');
            setDetailedAddress(initialValues.detailedAddress || '');
            setDeliveryReceiver(initialValues.deliveryReceiver || '');
            setDeliveryMemo(initialValues.deliveryMemo || '');

            // 전화번호를 '-'로 분리하여 각 필드에 할당
            if (initialValues.deliveryPhone) {
                const phoneParts = initialValues.deliveryPhone.split('-');
                if (phoneParts.length === 3) {
                    setPhoneFirst(phoneParts[0] || '010');
                    setPhoneMiddle(phoneParts[1] || '');
                    setPhoneLast(phoneParts[2] || '');
                }
            }
        }
    }, []); // 빈 배열로 두어 컴포넌트가 처음 렌더링될 때만 실행되도록 합니다.

    // 부모 컴포넌트에서 호출
    useImperativeHandle(ref, () => ({
        getFormData: () => {
            const deliveryPhone = `${phoneFirst}-${phoneMiddle}-${phoneLast}`;
            console.log({
                postalCode,
                deliveryAddress,
                detailedAddress,
                deliveryMemo,
                deliveryReceiver,
                deliveryPhone
            });

            // 유효성 검사를 먼저 실행
            if (!validateForm()) {
                return null; // 유효성 검사 실패 시 null 반환
            }

            return { postalCode, deliveryAddress, detailedAddress, deliveryMemo, deliveryReceiver, deliveryPhone };
        },
        setFormData: (address) => {
            setPostalCode(address.postalCode || '');
            setDeliveryAddress(address.deliveryAddress || '');
            setDetailedAddress(address.detailedAddress || '');
            setDeliveryReceiver(address.deliveryReceiver || '');
            setDeliveryMemo(address.deliveryMemo || '');

            const deliveryPhone = address.deliveryPhone || '';
            const phoneParts = deliveryPhone.split('-');
            if (phoneParts.length === 3) {
                setPhoneFirst(phoneParts[0] || '010');
                setPhoneMiddle(phoneParts[1] || '');
                setPhoneLast(phoneParts[2] || '');
            } else {
                // 기본값 설정
                setPhoneFirst('010');
                setPhoneMiddle('');
                setPhoneLast('');
            }
        }
    }));

    return (
        <div className="delivery-form">
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 80 }}>
                <h4 style={{ margin: 0, lineHeight: '1.5', paddingTop: 0 }}>배송 정보</h4>
                {showDefaultSelect && (
                    <button
                        className="btn btn-outline-primary"
                        style={{ marginLeft: '20px', padding: '8px 16px', height: '40px' }}
                        onClick={onAddressSelect}
                    >
                        기본 배송지 선택
                    </button>
                )}
            </div>
            <table className="delivery-table">
                <tbody>
                    <tr>
                        <td className="label-cell"><label>받는 분</label></td>
                        <td className="input-cell">
                            <input
                                type="text"
                                value={deliveryReceiver}
                                onChange={(e) => setDeliveryReceiver(e.target.value)}
                                required
                                placeholder="받는 분의 이름을 입력해주세요"
                            />
                            {errors.deliveryReceiver && <p style={{ color: 'red' }}>{errors.deliveryReceiver}</p>}
                        </td>
                    </tr>
                    <tr>
                        <td className="label-cell"><label>연락처</label></td>
                        <td className="input-cell phone-number-container">
                            <div className="phone-input-group">
                                <select
                                    value={phoneFirst}
                                    onChange={(e) => setPhoneFirst(e.target.value)}
                                >
                                    <option value="010">010</option>
                                    <option value="011">011</option>
                                    <option value="016">016</option>
                                    <option value="017">017</option>
                                </select>
                                <input
                                    type="text"
                                    value={phoneMiddle}
                                    onChange={(e) => setPhoneMiddle(e.target.value)}
                                    required
                                    maxLength={4}
                                />
                                <input
                                    type="text"
                                    value={phoneLast}
                                    onChange={(e) => setPhoneLast(e.target.value)}
                                    required
                                    maxLength={4}
                                />
                            </div>
                            {errors.phone && (
                                <p style={{ color: 'red' }}>{errors.phone}</p>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td className="label-cell"><label>우편번호</label></td>
                        <td className="input-cell">
                            <input
                                type="text"
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                                readOnly
                                required
                            />
                            {errors.postalCode && <p style={{ color: 'red' }}>{errors.postalCode}</p>}
                            <PostcodeSearch setPostalCode={setPostalCode} setDeliveryAddress={setDeliveryAddress} />
                        </td>
                    </tr>
                    <tr>
                        <td className="label-cell"><label>주소</label></td>
                        <td className="input-cell">
                            <input
                                type="text"
                                value={deliveryAddress}
                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                readOnly
                                required
                            />
                            {errors.deliveryAddress && <p style={{ color: 'red' }}>{errors.deliveryAddress}</p>}
                        </td>
                    </tr>
                    <tr>
                        <td className="label-cell"><label>상세주소</label></td>
                        <td className="input-cell">
                            <input
                                type="text"
                                value={detailedAddress}
                                onChange={(e) => setDetailedAddress(e.target.value)}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="label-cell"><label>배송 메모</label></td>
                        <td className="input-cell">
                            <input
                                type="text"
                                value={deliveryMemo}
                                onChange={(e) => setDeliveryMemo(e.target.value)}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
});

export default DeliveryForm;
