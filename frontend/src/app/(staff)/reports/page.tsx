'use client';

import React, { useState } from 'react';
import { Card, Typography, Space, Form, Select, DatePicker, Button, message, List, Tag } from 'antd';
import { DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import { useGenerateReport } from '@/hooks/use-analytics';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function ReportsPage() {
  const [form] = Form.useForm();
  const generateReport = useGenerateReport();
  const [auditLogs, setAuditLogs] = useState([
    { id: '1', report: 'PATIENT_CENSUS', date: '2026-09-07 09:30 AM', user: 'Dr. Smith', format: 'CSV' },
    { id: '2', report: 'CARE_GAPS', date: '2026-09-06 14:15 PM', user: 'Nurse Joy', format: 'JSON' },
  ]);

  const onFinish = (values: any) => {
    const dto = {
      reportType: values.reportType,
      startDate: values.dateRange[0].toISOString(),
      endDate: values.dateRange[1].toISOString(),
      departmentId: values.departmentId,
      format: values.format,
    };

    generateReport.mutate(dto, {
      onSuccess: (data) => {
        message.success(`Report generated successfully!`);
        
        // Add to audit logs (mock update)
        setAuditLogs([{
          id: Date.now().toString(),
          report: dto.reportType,
          date: new Date().toLocaleString(),
          user: 'Current User',
          format: dto.format
        }, ...auditLogs]);

        // Trigger mock download
        const blob = new Blob([data.data || ''], { type: dto.format === 'CSV' ? 'text/csv' : 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      onError: () => {
        message.error('Failed to generate report.');
      }
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Reports Generator</Title>
          <Text type="secondary">Generate configurable clinical & operational reports</Text>
        </div>

        <Card title="Report Configuration" bordered={false}>
          <Form 
            form={form} 
            layout="vertical" 
            onFinish={onFinish}
            initialValues={{ format: 'CSV' }}
          >
            <Form.Item 
              name="reportType" 
              label="Report Type" 
              rules={[{ required: true, message: 'Please select a report type' }]}
            >
              <Select placeholder="Select Report Type">
                <Select.Option value="PATIENT_CENSUS">Patient Census</Select.Option>
                <Select.Option value="CARE_GAPS">Care Gaps Analysis</Select.Option>
                <Select.Option value="INVESTIGATION_TAT">Investigation TAT</Select.Option>
                <Select.Option value="TREATMENT_COMPLETION">Treatment Completion Status</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item 
              name="dateRange" 
              label="Date Range" 
              rules={[{ required: true, message: 'Please select date range' }]}
            >
              <RangePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="departmentId" label="Department (Optional)">
              <Select placeholder="All Departments" allowClear>
                <Select.Option value="ONC_MED">Medical Oncology</Select.Option>
                <Select.Option value="ONC_SURG">Surgical Oncology</Select.Option>
                <Select.Option value="ONC_RAD">Radiation Oncology</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item 
              name="format" 
              label="Export Format"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value="CSV">CSV File</Select.Option>
                <Select.Option value="JSON">JSON File</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<DownloadOutlined />}
                loading={generateReport.isPending}
                size="large"
              >
                Generate & Download Report
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card title="Recent Report Exports (Audit Log)" bordered={false}>
          <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
            <FileTextOutlined /> DPDP Compliance Display: All data access is logged.
          </Text>
          <List
            dataSource={auditLogs}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  title={item.report}
                  description={`Exported by ${item.user} on ${item.date}`}
                />
                <Tag color={item.format === 'CSV' ? 'green' : 'blue'}>{item.format}</Tag>
              </List.Item>
            )}
          />
        </Card>
      </Space>
    </div>
  );
}
