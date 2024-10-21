import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import './deliveryForm.css';
import PostcodeSearch from "./PostcodeSearch";

const DeliveryForm = forwardRef(({ initialValues = {}, onAddressSelect, onNewAddress, showDefaultSelect = true }, ref) => {
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

            // 기본 배송지가 있을 경우 readOnly 설정
            console.log("기본배송지가 있으면 readOnly: true");
            setIsReadOnly(!!initialValues.postalCode); // 기본 배송지가 있으면 true

        }
    }, []); // 빈 배열로 두어 컴포넌트가 처음 렌더링될 때만 실행되도록 합니다.

    // 부모 컴포넌트에서 호출
    useImperativeHandle(ref, () => ({
        getFormData: () => {
            const deliveryPhone = `${phoneFirst}-${phoneMiddle}-${phoneLast}`;
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

            setIsReadOnly(true); // 기본적으로 true, 수정 버튼을 눌렀을 때만 false로 변경
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
        },
        // 추가된 부분: setIsReadOnly 함수 정의
        setIsReadOnly: (isReadOnly) => {
            console.log(`setIsReadOnly 호출: ${isReadOnly}`);
            setIsReadOnly(isReadOnly); // readOnly 상태 변경 함수
        }
    }));

    return (
        <div className="delivery-form">
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 80 }}>
                <h4 style={{ margin: 0, lineHeight: '1.5', paddingTop: 0 }}>배송 정보</h4>

                {/* 기본 배송지 선택 버튼은 항상 표시 */}
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
                    onClick={onNewAddress} // 새 배송지 입력 버튼
                >
                    새 배송지 입력
                </button>

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
                    </td>
                </tr>
                <tr>
                    <td className="label-cell"><label>연락처</label></td>
                    <td className="input-cell phone-number-container">
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
            {!isDefaultAddress  && (
                <div className="form-check" style={{ marginTop: '10px' }}>
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="saveAsDefault"
                        checked={saveAsDefault}
                        onChange={(e) => setSaveAsDefault(e.target.checked)}
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