'use client';
import { MouseEvent, useEffect, useState } from 'react';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged, signOut } from 'firebase/auth';

import { auth } from '@/firebase/firebase';

import { REMOVE_ACTIVE_USER, SET_ACTIVE_USER } from '@/redux/slice/authSlice';

import styles from './Header.module.scss';
import InnerHeader from '../innerHeader/InnerHeader';

const Header = () => {
  const pathname = usePathname();
  const dispatch = useDispatch();

  const router = useRouter();

  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        // 로그아웃 상태
        setDisplayName('');

        // 유저 정보를 리덕스 스토어에서 지우기
        dispatch(REMOVE_ACTIVE_USER());
        return;
      }

      // 로그인 상태 && 일반 로그인
      if (user.displayName === null) {
        if (!user.email) return;

        const u1 = user.email.substring(0, user.email.indexOf('@'));
        const uName = u1.charAt(0).toUpperCase() + u1.slice(1);

        setDisplayName(uName);
      } else {
        // 로그인 상태 && 구글 로그인
        setDisplayName(user.displayName);
      }

      // 유저 정보를 리덕스 스토어에 저장한다.
      dispatch(
        SET_ACTIVE_USER({
          email: user.email,
          userName: user.displayName ? user.displayName : displayName,
          userID: user.uid,
        })
      );
    });
  }, [dispatch, displayName]);

  const logoutUser = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    signOut(auth)
      .then(() => {
        toast.success('로그아웃 되었습니다.');
        router.push('/');
      })
      .catch((error) => toast.error(error.message));
  };

  if (['/login', '/register', '/reset'].includes(pathname)) return null;

  return (
    <header>
      <div className={styles.loginBar}>
        <ul className={styles.list}>
          <li className={styles.item}>
            <Link href={'/login'}>로그인</Link>
          </li>
          <li className={styles.item}>
            <Link href={'/admin/dashboard'}>관리자</Link>
          </li>

          <li className={styles.item}>
            <Link href={'/order-history'}>주문 목록</Link>
          </li>
          <li className={styles.item}>
            <Link href={'/'} onClick={logoutUser}>
              로그아웃
            </Link>
          </li>

          <li className={styles.item}>
            <Link href={'/'}>제휴 마케팅</Link>
          </li>

          <li className={styles.item}>
            <Link href={'/'}>쿠팡 플레이</Link>
          </li>

          <li className={styles.item}>
            <Link href={'/'}>고객센터</Link>
          </li>
        </ul>
      </div>

      {pathname.startsWith('/admin') ? null : <InnerHeader />}
    </header>
  );
};

export default Header;
