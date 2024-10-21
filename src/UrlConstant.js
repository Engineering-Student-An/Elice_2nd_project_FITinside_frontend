import React, { createContext } from 'react';

// Context 생성
export const UrlConstantContext = createContext();

// 불변 전역 변수를 제공하는 Provider 컴포넌트
export const UrlConstantProvider = ({ children }) => {
    const value = 'Http://localhost:8080';

    return (
        <UrlConstantContext.Provider value={value}>
            {children}
        </UrlConstantContext.Provider>
    );
};
