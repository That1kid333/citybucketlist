import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { Rider } from '../types/rider';

interface RiderOverviewProps {
  rider: Rider;
}

const RiderOverview: React.FC<RiderOverviewProps> = ({ rider }) => {
  return (
    <Card title="Rider Overview" className="rider-overview">
      <Row gutter={16}>
        <Col span={8}>
          <Statistic 
            title="Total Rides" 
            value={rider.rideHistory?.length || 0} 
          />
        </Col>
        <Col span={8}>
          <Statistic 
            title="Member Since" 
            value={new Date(rider.createdAt).toLocaleDateString()} 
          />
        </Col>
        <Col span={8}>
          <Statistic 
            title="Last Ride" 
            value={rider.rideHistory?.[0]?.date ? new Date(rider.rideHistory[0].date).toLocaleDateString() : 'No rides yet'} 
          />
        </Col>
      </Row>
    </Card>
  );
};

export default RiderOverview;
