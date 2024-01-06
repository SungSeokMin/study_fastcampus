'use client';

import React, { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { toast } from 'react-toastify';

import Button from '@/components/button/Button';
import Divider from '@/components/divider/Divider';
import Input from '@/components/input/Input';
import Loader from '@/components/loader/Loader';

import LogoPath from '@/assets/colorful.svg';

import { auth } from '@/firebase/firebase';

import styles from '../login/Login.module.scss';

const RegisterClient = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cPassword, setCpassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const registerUser = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== cPassword) {
      return toast.error('비밀번호가 일치하지 않습니다.');
    }

    setIsLoading(true);

    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        toast.success('등록 성공...');
        router.push('/login');
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      {isLoading && <Loader />}
      <section className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.logo}>
            <Image src={LogoPath} width={246} height={56} alt="logo" />
          </h1>

          <form onSubmit={registerUser} className={styles.form}>
            <Input
              email
              icon="letter"
              id="email"
              name="email"
              label="이메일"
              placeholder="아이디(이메일)"
              className={styles.control}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <Input
              password
              icon="lock"
              id="password"
              name="password"
              label="비밀번호"
              placeholder="비밀번호"
              className={styles.control}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            <Input
              password
              icon="lock"
              id="password"
              name="password"
              label="비밀번호 확인"
              placeholder="비밀번호 확인"
              className={styles.control}
              value={cPassword}
              onChange={(event) => setCpassword(event.target.value)}
            />

            <div className={styles.buttonGroup}>
              <Button type="submit" width="100%">
                회원가입
              </Button>
              <Divider />

              <Button width="100%" secondary>
                <Link href="/login">로그인</Link>
              </Button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default RegisterClient;
