'use client';

import { Form, Input, Button, notification, type FormProps } from 'antd';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import NextLink from 'next/link';
import { useState } from 'react';
import { openNotificationWithIcon } from '@/utils/notification';

// Type for form fields
type FieldType = {
  fullName: string;
  email: string;
  password: string;
};

export default function SignUp() {
  const [loading, setLoading] = useState<boolean>(false);
  const [api, contextHolder] = notification.useNotification();
  const [form] = Form.useForm<FieldType>();

  // Handle form submission
  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!baseUrl) {
        throw new Error('No API url provided');
      }
      const response = await fetch(`${baseUrl}/auth/signup`, {
        method: 'POST',
        body: JSON.stringify(values),
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      const data = await response.json();

      if (!response.ok) {
        openNotificationWithIcon(api, 'error', 'Failure', data.message);
      } else {
        openNotificationWithIcon(api, 'success', 'Success', data.message);
      }
    } catch (error) {
      console.error('Error during sign up:', error);
      openNotificationWithIcon(api, 'error', 'Error', 'An unexpected error occurred. Please try again later.');
    } finally {
      form.resetFields();
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <h1 className="text-4xl font-bold mb-6">Create your account</h1>
      <p className="mb-6">Join BookWise today and unlock a world of academic resources at your fingertips.</p>

      <Form layout="vertical" name="signup_form" onFinish={onFinish} form={form} autoComplete="off">
        <Form.Item<FieldType>
          label="Full Name"
          name="fullName"
          rules={[{ required: true, message: 'Please input your full name!' }]}>
          <Input prefix={<UserOutlined />} placeholder="Your full name" disabled={loading} />
        </Form.Item>

        <Form.Item<FieldType>
          label="Email"
          name="email"
          rules={[{ required: true, message: 'Please input your email!' }]}>
          <Input prefix={<MailOutlined />} placeholder="Your email" disabled={loading} />
        </Form.Item>

        <Form.Item<FieldType>
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}>
          <Input.Password prefix={<LockOutlined />} placeholder="Your password" disabled={loading} />
        </Form.Item>

        <Button type="primary" htmlType="submit" className="w-full mt-2" loading={loading}>
          Create Account
        </Button>
      </Form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?
        <NextLink href="/signin">
          <Button type="link">Sign in</Button>
        </NextLink>
      </p>
    </>
  );
}
