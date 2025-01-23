// import React from 'react';
//
// const Home = () => {
//     return (
//         <h2>홈 화면</h2>
//     );
// };
//
// export default Home;

import React from 'react';
import AdBanner from './mainPage/components/AdBanner';
import CategoryList from './mainPage/components/CategoryList';

const Home = () => {
    return (
        <div>
            <AdBanner />
            <CategoryList />
        </div>
    );
};

export default Home;

//-----
// import React, { useEffect, useState } from 'react';
// import AdBanner from './mainPage/components/AdBanner';
// import CategoryList from './mainPage/components/CategoryList';
//
// const Home = () => {
//     const [userRole, setUserRole] = useState(null);
//
//     // 사용자 역할 정보를 가져오는 함수 - 실제 API 호출로 대체해야 함
//     const fetchUserRoleFromAPI = async () => {
//         // 예시: API 호출 결과를 통해 역할 정보를 가져옴
//         // 실제로는 API에서 역할 정보를 받아오는 로직이 들어가야 합니다.
//         const role = 'admin'; // 'admin' 또는 'user'를 반환한다고 가정
//         return role;
//     };
//
//     useEffect(() => {
//         const getUserRole = async () => {
//             const role = await fetchUserRoleFromAPI();
//             setUserRole(role);
//         };
//         getUserRole();
//     }, []);
//
//     return (
//         <div>
//             <AdBanner userRole={userRole} />
//             <CategoryList userRole={userRole} />
//         </div>
//     );
// };
//
// export default Home;
//---------------------

// import React, { useEffect, useState } from 'react';
// import AdBanner from './mainPage/components/AdBanner';
// import CategoryList from './mainPage/components/CategoryList';
//
// const fetchUserRoleFromAPI = async () => {
//     const token = localStorage.getItem('token'); // 로컬 스토리지에서 JWT 토큰 가져오기
//     if (!token) {
//         throw new Error('인증 토큰이 없습니다.');
//     }
//
//     const response = await fetch('/fr/api/user/role', {
//         method: 'GET',
//         headers: {
//             'Authorization': `Bearer ${token}`, // Authorization 헤더에 토큰 추가
//         },
//     });
//
//     if (!response.ok) {
//         throw new Error('사용자 역할 정보를 가져오는 데 실패했습니다.');
//     }
//
//     const role = await response.text(); // 서버에서 반환된 역할 정보
//     return role;
// };
//
// const Home = () => {
//     const [userRole, setUserRole] = useState(null); // 사용자 역할 정보를 저장할 상태
//     const [error, setError] = useState(''); // 에러 상태
//
//     useEffect(() => {
//         const getUserRole = async () => {
//             try {
//                 const role = await fetchUserRoleFromAPI();
//                 setUserRole(role); // 역할 정보를 상태에 저장
//             } catch (err) {
//                 setError('사용자 역할 정보를 가져오는 데 실패했습니다.');
//                 console.error("Error fetching user role:", err);
//             }
//         };
//
//         getUserRole();
//     }, []); // 컴포넌트가 처음 렌더링될 때 한 번만 실행
//
//     return (
//         <div>
//             <AdBanner userRole={userRole} />
//             <CategoryList userRole={userRole} />
//
//             {/* 에러 메시지 */}
//             {error && <p className="text-danger text-center">{error}</p>}
//
//             {/* 역할에 따른 UI 표시 */}
//             {userRole === 'ROLE_ADMIN' && (
//                 <div>
//                     <h2>관리자 전용 페이지</h2>
//                     <p>이 섹션은 관리자에게만 표시됩니다.</p>
//                 </div>
//             )}
//             {userRole === 'ROLE_USER' && (
//                 <div>
//                     <h2>사용자 전용 페이지</h2>
//                     <p>이 섹션은 일반 사용자에게만 표시됩니다.</p>
//                 </div>
//             )}
//             {!userRole && !error && (
//                 <p className="text-center">사용자 역할을 가져오는 중입니다...</p>
//             )}
//         </div>
//     );
// };
//
// export default Home;
//---------------------

// import React, { useEffect, useState } from 'react';
// import AdBanner from './mainPage/components/AdBanner';
// import CategoryList from './mainPage/components/CategoryList';
//
// const fetchUserRoleFromAPI = async () => {
//     const token = localStorage.getItem('token'); // 로컬 스토리지에서 JWT 토큰 가져오기
//     if (!token) {
//         throw new Error('인증 토큰이 없습니다.');
//     }
//
//     const response = await fetch('/fr/api/user/role', {
//         method: 'GET',
//         headers: {
//             'Authorization': `Bearer ${token}`, // Authorization 헤더에 토큰 추가
//         },
//     });
//
//     if (!response.ok) {
//         // throw new Error('사용자 역할 정보를 가져오는 데 실패했습니다.');
//     }
//
//     const role = await response.text(); // 서버에서 반환된 역할 정보
//     return role;
// };
//
// const Home = () => {
//     const [userRole, setUserRole] = useState(null); // 사용자 역할 정보를 저장할 상태
//     const [error, setError] = useState(''); // 에러 상태
//
//     useEffect(() => {
//         const getUserRole = async () => {
//             try {
//                 const role = await fetchUserRoleFromAPI();
//                 setUserRole(role); // 역할 정보를 상태에 저장
//             } catch (err) {
//                 // setError('사용자 역할 정보를 가져오는 데 실패했습니다.');
//                 console.error("Error fetching user role:", err);
//             }
//         };
//
//         getUserRole();
//     }, []); // 컴포넌트가 처음 렌더링될 때 한 번만 실행
//
//     return (
//         <div>
//             <AdBanner userRole={userRole} />
//             <CategoryList userRole={userRole} />
//
//             {/* 에러 메시지 */}
//             {error && <p className="text-danger text-center">{error}</p>}
//
//             {/*{!userRole && !error && (*/}
//             {/*    <p className="text-center">사용자 역할을 가져오는 중입니다...</p>*/}
//             {/*)}*/}
//         </div>
//     );
// };
//
// export default Home;
