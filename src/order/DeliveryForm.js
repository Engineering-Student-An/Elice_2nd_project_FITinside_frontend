import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import './deliveryForm.css';
import PostcodeSearch from "./PostcodeSearch";

const DeliveryForm = forwardRef(({ initialValues = {}, onAddressSelect, onNewAddress, showDefaultSelect = true, hideButtons = false, forceShowCheckbox = false }, ref) => {
    const [postalCode, setPostalCode] = useState(initialValues.postalCode || '');
    const [deliveryAddress, setDeliveryAddress] = useState(initialValues.deliveryAddress || '');
    const [detailedAddress, setDetailedAddress] = useState(initialValues.detailedAddress || '');
    const [deliveryReceiver, setDeliveryReceiver] = useState(initialValues.deliveryReceiver || '');
    const [deliveryMemo, setDeliveryMemo] = useState(initialValues.deliveryMemo || '');
    const [phoneFirst, setPhoneFirst] = useState('010');
    const [phoneMiddle, setPhoneMiddle] = useState('');
    const [phoneLast, setPhoneLast] = useState('');
    const [isReadOnly, setIsReadOnly] = useState(true); // readOnly 상태 관리
    const [saveAsDefault, setSaveAsDefault] = useState(false); // 기본 배송지로 저장 여부 상태 추가
    const [isDefaultAddress, setIsDefaultAddress] = useState(false); // 기본 배송지 여부 관리

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

        // 수령인 유효성 검사: 문자만 허용, 숫자 및 특수문자 제외
        const nameRegex = /^[가-힣a-zA-Z\s]+$/;
        if (!deliveryReceiver.trim()) {
            newErrors.deliveryReceiver = '수령인을 입력해주세요.';
            formIsValid = false;
        } else if (!nameRegex.test(deliveryReceiver)) {
            newErrors.deliveryReceiver = '수령인은 문자만 입력 가능합니다.';
            formIsValid = false;
        }

        // 전화번호 유효성 검사: 각 칸은 숫자만 허용, 3~4자리 제한
        const phoneRegex = /^[0-9]+$/;
        if (!phoneMiddle.trim() || !phoneLast.trim()) {
            newErrors.phone = '연락처를 입력해주세요.';
            formIsValid = false;
        } else if (phoneMiddle.length < 3 || phoneMiddle.length > 4 || !phoneRegex.test(phoneMiddle)) {
            newErrors.phone = '중간 번호는 3~4자리의 숫자여야 합니다.';
            formIsValid = false;
        } else if (phoneLast.length < 4 || phoneLast.length > 4 || !phoneRegex.test(phoneLast)) {
            newErrors.phone = '마지막 번호는 4자리의 숫자여야 합니다.';
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

            // 유효성 검사를 먼저 실행
            if (!validateForm()) {
                return null; // 유효성 검사 실패 시 null 반환
            }

            return { postalCode, deliveryAddress, detailedAddress, deliveryMemo, deliveryReceiver, deliveryPhone, saveAsDefault };
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

            console.log('데이터 변환: ', isReadOnly);
            // setIsReadOnly(true); // 기본적으로 true, 수정 버튼을 눌렀을 때만 false로 변경
            // setIsReadOnly(false); // 수정할 때 readOnly 해제
            // setSaveAsDefault(false); // 수정 시 기본 배송지 체크 초기화
        },
        clearFormData: () => {
            setPostalCode('');
            setDeliveryAddress('');
            setDetailedAddress('');
            setDeliveryReceiver('');
            setDeliveryMemo('');
            setPhoneFirst('010');
            setPhoneMiddle('');
            setPhoneLast('');
            setIsReadOnly(false); // 새 배송지이므로 수정 가능 상태로 변경
            setSaveAsDefault(false); // 폼 초기화 시 기본 배송지 저장 여부 초기화
        },
        setIsDefaultAddress: (isDefault) => {
            setIsDefaultAddress(isDefault); // 기본 배송지 여부 설정
            setSaveAsDefault(isDefault);
            console.log('setSaveAsDefault: ', saveAsDefault);
        },
        // 추가된 부분: setIsReadOnly 함수 정의
        setIsReadOnly: (isReadOnly) => {
            console.log(`setIsReadOnly 호출: ${isReadOnly}`);
            setIsReadOnly(isReadOnly); // readOnly 상태 변경 함수
        }
    }));

    return (
        <div className="delivery-form">
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 50 }}>
                <h4 style={{ margin: 0, lineHeight: '1.5', paddingTop: 0 }}>배송 정보</h4>

                {/* hideButtons가 true일 때 버튼 숨김 */}
                {!hideButtons && (
                    <>
                        <button
                            className="btn btn-outline-primary"
                            style={{ marginLeft: '20px', padding: '8px 16px', height: '40px' }}
                            onClick={onAddressSelect}
                        >
                            배송지 선택
                        </button>
                        <button
                            className="btn btn-outline-secondary"
                            style={{ marginLeft: '10px', padding: '8px 16px', height: '40px' }}
                            onClick={onNewAddress}
                        >
                            새 배송지 추가
                        </button>
                    </>
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
                            readOnly={isReadOnly} // readOnly 상태 적용
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
                                disabled={isReadOnly} // readOnly 대신 disabled 적용
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
                                readOnly={isReadOnly}
                                required
                                maxLength={4}
                            />
                            <input
                                type="text"
                                value={phoneLast}
                                onChange={(e) => setPhoneLast(e.target.value)}
                                readOnly={isReadOnly}
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
                        <PostcodeSearch setPostalCode={setPostalCode} setDeliveryAddress={setDeliveryAddress} disabled={isReadOnly} />
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
                            readOnly={isReadOnly}
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
                            readOnly={isReadOnly}
                        />
                    </td>
                </tr>
                </tbody>
            </table>

            {/* 기본 배송지로 저장 체크박스 */}
            {(forceShowCheckbox || (!isDefaultAddress && !hideButtons)) && (
                <div className="form-check" style={{ marginTop: '10px' }}>
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="saveAsDefault"
                        checked={saveAsDefault}
                        onChange={(e) => {
                            setSaveAsDefault(e.target.checked); // 상태 업데이트
                            console.log('체크박스 상태 변경: ', e.target.checked);
                        }}
                    />
                    <label className="form-check-label" htmlFor="saveAsDefault" style={{ marginLeft: '8px' }}>
                        이 주소를 기본 배송지로 저장
                    </label>
                </div>
            )}

        </div>
    );
});

export default DeliveryForm;