'use client';

import React, { useState } from 'react';
import { Typography, Card, Row, Col, Radio, Tag, Modal, Space } from 'antd';
import { BookOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export default function PortalEducation() {
  const [language, setLanguage] = useState('en');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  const categories = [
    { id: '1', title: 'Managing Chemotherapy', tag: 'Treatment' },
    { id: '2', title: 'Dietary Advice in India', tag: 'Nutrition' },
    { id: '3', title: 'Palliative Care', tag: 'Care' },
    { id: '4', title: 'Financial Assistance (PMJAY)', tag: 'Finance' }
  ];

  const recommended = [
    { id: '1', title: 'Managing Chemotherapy', tag: 'Treatment' },
    { id: '2', title: 'Dietary Advice in India', tag: 'Nutrition' }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Education Library</Title>
        <Radio.Group value={language} onChange={e => setLanguage(e.target.value)} buttonStyle="solid">
          <Radio.Button value="en">English</Radio.Button>
          <Radio.Button value="hi">हिंदी</Radio.Button>
          <Radio.Button value="mr">मराठी</Radio.Button>
        </Radio.Group>
      </div>

      {recommended.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <Title level={4} style={{ color: '#1890ff' }}>Recommended for You</Title>
          <Row gutter={[16, 16]}>
            {recommended.map(cat => (
              <Col xs={24} sm={12} md={8} key={cat.id}>
                <Card 
                  hoverable 
                  onClick={() => setSelectedArticle(cat)}
                  style={{ height: '100%', borderColor: '#1890ff', borderWidth: 2 }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Tag color="blue">{cat.tag}</Tag>
                    <Title level={5} style={{ marginTop: 8 }}>{cat.title}</Title>
                    <Text type="secondary">Read more about {cat.title.toLowerCase()}...</Text>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      <div>
        <Title level={4}>All Resources</Title>
        <Row gutter={[16, 16]}>
          {categories.map(cat => (
            <Col xs={24} sm={12} md={8} key={cat.id}>
              <Card 
                hoverable 
                onClick={() => setSelectedArticle(cat)}
                style={{ height: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Tag color="blue">{cat.tag}</Tag>
                  <Title level={5} style={{ marginTop: 8 }}>{cat.title}</Title>
                  <Text type="secondary">Read more about {cat.title.toLowerCase()}...</Text>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <Modal
        title={selectedArticle?.title}
        open={!!selectedArticle}
        onCancel={() => setSelectedArticle(null)}
        footer={null}
        width={800}
      >
        <div style={{ padding: '16px 0' }}>
          <Tag color="blue" style={{ marginBottom: 16 }}>{selectedArticle?.tag}</Tag>
          <Paragraph>
            This is the content for {selectedArticle?.title}. In a real application, this would render the Markdown or rich text content fetched from the API based on the selected language ({language}).
          </Paragraph>
          <Paragraph>
            CancerCare360 provides verified, culturally adapted educational materials to help you and your family navigate your care journey.
          </Paragraph>
        </div>
      </Modal>
    </div>
  );
}
