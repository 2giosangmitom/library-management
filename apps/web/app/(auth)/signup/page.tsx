'use client';

import { Form, Input, Button, type FormProps } from 'antd';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import NextLink from 'next/link';

type FieldType = {
  fullName: string;
  email: string;
  password: string;
};

const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
  console.log('Success:', values);
};

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
  console.log('Failed:', errorInfo);
};

export default function SignUp() {
  return (
    <>
      <h1 className="text-4xl font-bold mb-6">Create your account</h1>
      <p className="mb-6">Join BookWise today and unlock a world of academic resources at your fingertips.</p>

      <Form
        layout="vertical"
        name="signup_form"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off">
        <Form.Item<FieldType>
          label="Full Name"
          name="fullName"
          rules={[{ required: true, message: 'Please input your full name!' }]}>
          <Input prefix={<UserOutlined />} placeholder="Your full name" />
        </Form.Item>

        <Form.Item<FieldType>
          label="Email"
          name="email"
          rules={[{ required: true, message: 'Please input your email!' }]}>
          <Input prefix={<MailOutlined />} placeholder="Your email" />
        </Form.Item>

        <Form.Item<FieldType>
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}>
          <Input.Password prefix={<LockOutlined />} placeholder="Your password" />
        </Form.Item>

        <Form.Item label={null}>
          <Button type="primary" htmlType="submit" className="w-full">
            Create Account
          </Button>
        </Form.Item>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?
          <NextLink href="/signin">
            <Button type="link">Sign in</Button>
          </NextLink>
        </p>
      </Form>
    </>
  );
}
