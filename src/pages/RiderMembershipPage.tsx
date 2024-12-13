import React from 'react';
import { Layout } from 'antd';
import { Sidebar } from '../components/Sidebar';
import RiderMembership from '../components/RiderMembership';

const { Content } = Layout;

const RiderMembershipPage: React.FC = () => {
  return (
    <Layout className="min-h-screen">
      <Sidebar userType="rider" />
      <Layout>
        <Content className="bg-white m-6 p-6 rounded-lg">
          <RiderMembership />
        </Content>
      </Layout>
    </Layout>
  );
};

export default RiderMembershipPage;
