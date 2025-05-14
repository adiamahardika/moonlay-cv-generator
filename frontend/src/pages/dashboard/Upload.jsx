import React, { useState } from 'react';
import { Button, Upload, Typography, Space, message, Card, Row, Col } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

const UploadComponent = () => {
  const [fileList, setFileList] = useState([]);

  const handleChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const handleUpload = () => {
    if (fileList.length === 0) {
      message.warning('Please select a file first.');
      return;
    }

    // Simulated upload
    message.success(`Successfully uploaded ${fileList[0].name}`);
    setFileList([]);
  };

  const handleClear = () => {
    setFileList([]);
    message.info('Upload has been cleared.');
  };

  return (
    <Row 
      justify="center" 
      align="middle" 
      style={{ height: '100vh', backgroundColor: '#f5f5f5' }}
    >
      <Col xs={22} sm={18} md={14} lg={10} xl={8}>
        <Card 
          style={{ textAlign: 'center', padding: 32, borderRadius: 12 }}
          bodyStyle={{ padding: 0 }}
        >
          <Title level={2} style={{ marginBottom: 30 }}>Upload</Title>

          <Upload
            beforeUpload={() => false}
            onChange={handleChange}
            fileList={fileList}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />} size="large">Choose File</Button>
          </Upload>

          <Space size="large" style={{ marginTop: 30 }}>
            <Button type="primary" size="large" onClick={handleUpload}>
              Upload
            </Button>
            <Button icon={<DeleteOutlined />} size="large" onClick={handleClear}>
              Clear Uploads
            </Button>
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default UploadComponent;
