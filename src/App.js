import React from "react";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import { Header, Footer } from "./fragments";
import Home from "./Home";
import { Cart } from "./cart";
import { ProductSection, ProductList } from "./product";
import { Login, Signup, GoogleTokenCheck } from "./auth";
import {AdminDeleteMemberPage, AdminMemberPage, MyPage} from "./member";
import { OrderCreate, OrderDetail, OrderList, OrderAdminList } from "./order";
import { CouponAdmin, CouponList, WelcomeCouponList } from "./coupon";
import AdminPage from "./AdminPage";
import { CategoryAdminMain, CategoryCreate, CategoryUpdate } from "./category";
import { ProductAdmin, ProductCreate, ProductUpdate } from './product/admin';
import { AddressList } from "./address";
import { BannerAdminMain, BannerCreate, BannerUpdate } from "./banner";
import ProtectedRoute from "./ProtectedRoute";
import ProtectedAdminRoute from "./ProtectedAdminRoute";
import AccessDeniedPage from "./AccessDeniedPage";


const App = () => {
    return (
        <Router>
            <div id="root">
                <Header />
                <main className="flex-grow-1">
                    <Routes>
                        <Route path="/" element={<Home />} /> {/* 홈 화면 */}

                        <Route path="/admin" element={<ProtectedAdminRoute><AdminPage/></ProtectedAdminRoute>} /> {/*관리자 화면*/}
                        <Route path="/access-denied" element={<AccessDeniedPage />}></Route>    {/*관리자 권한이 없을 때의 페이지*/}

                        <Route path="/login" element={<Login />} /> {/* login 화면 */}
                        <Route path="/signup" element={<Signup />} /> {/* login 화면 */}
                        <Route path="/tokenCheck" element={<GoogleTokenCheck />} /> {/* Google로그인 후 토큰 저장 */}
                        <Route path="/me" element={<ProtectedRoute><MyPage /></ProtectedRoute>} /> {/* mypage 화면 */}
                        <Route path="/admin/member" element={<ProtectedAdminRoute><AdminMemberPage /></ProtectedAdminRoute>} /> {/* 회원 관리 화면 */}
                        <Route path="/admin/member/delete" element={<ProtectedAdminRoute><AdminDeleteMemberPage /></ProtectedAdminRoute>} /> {/* 탈퇴 회원 관리 화면 */}

                        <Route path="/cart" element={<Cart />} /> {/* 장바구니 화면 */}

                        <Route path="/order" element={<ProtectedRoute><OrderCreate /></ProtectedRoute>} /> {/* 주문서 작성 화면 */}
                        <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} /> {/* 상세 주문 화면*/}
                        <Route path="/orders" element={<ProtectedRoute><OrderList /></ProtectedRoute>} /> {/* 주문 목록 화면 */}
                        <Route path="/admin/orders" element={<ProtectedAdminRoute><OrderAdminList /></ProtectedAdminRoute>}/> {/*관리자 주문 목록 화면*/}

                        <Route path="/admin/coupons" element={<ProtectedAdminRoute><CouponAdmin /></ProtectedAdminRoute>} /> {/*쿠폰 관리자 화면*/}
                        <Route path="/coupons" element={<ProtectedRoute><CouponList /></ProtectedRoute>} /> {/*쿠폰 회원 화면*/}
                        <Route path="/coupons/welcome" element={<ProtectedRoute><WelcomeCouponList /></ProtectedRoute>} /> {/*웰컴 쿠폰 화면*/}

                        <Route path="/admin/categories" element={<ProtectedAdminRoute><CategoryAdminMain /></ProtectedAdminRoute>} />
                        <Route path="/category-create" element={<ProtectedAdminRoute><CategoryCreate /></ProtectedAdminRoute>} />
                        <Route path="/category-update/:id" element={<ProtectedAdminRoute><CategoryUpdate /></ProtectedAdminRoute>} />

                        <Route path="/admin/banners" element={<ProtectedAdminRoute><BannerAdminMain /></ProtectedAdminRoute>} /> {/* 배너 관리자 화면 */}
                        <Route path="/admin/banner/create" element={<ProtectedAdminRoute><BannerCreate /></ProtectedAdminRoute>} /> {/* 배너 생성 화면 */}
                        <Route path="/admin/banner/update/:id" element={<ProtectedAdminRoute><BannerUpdate /></ProtectedAdminRoute>} /> {/* 배너 수정 화면 */}

                        <Route path="/product/:id" element={<ProductSection />} />
                        <Route path="/products/category/:categoryId" element={<ProductList />} />
                        <Route path="/admin/products" element={<ProtectedAdminRoute><ProductAdmin /></ProtectedAdminRoute>} /> {/* 관리자 상품 관리 화면 */}
                        <Route path="/admin/products/create" element={<ProtectedAdminRoute><ProductCreate /></ProtectedAdminRoute>} />
                        <Route path="/admin/products/update/:id" element={<ProtectedAdminRoute><ProductUpdate /></ProtectedAdminRoute>} />

                        <Route path="/addresses" element={<ProtectedRoute><AddressList /></ProtectedRoute>} /> {/*배송지 목록 화면*/}
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
};

export default App;
