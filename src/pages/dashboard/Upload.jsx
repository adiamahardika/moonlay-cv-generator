import React, { useState } from 'react';
import { Button, Upload, Typography, Space, message, Card, Row, Col } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

const UploadComponent = () => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileList[0].originFileObj); // Ambil file asli dari antd Upload

    setUploading(true);
    try {
      const response = await fetch('http://localhost:5000/api/upload/manual', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        message.success(`Successfully uploaded: ${result.filename}`);
        console.log('File URL:', result.url);
        setFileList([]);
      } else {
        message.error(result.error || 'Upload failed.');
      }
    } catch (error) {
      console.error(error);
      message.error('Something went wrong while uploading.');
    } finally {
      setUploading(false);
    }
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
          <Title level={2} style={{ marginBottom: 30 }}>Upload Manual CV</Title>

          <Upload
            beforeUpload={() => false} // Supaya antd tidak langsung upload otomatis
            onChange={handleChange}
            fileList={fileList}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />} size="large">Choose File</Button>
          </Upload>

          <Space size="large" style={{ marginTop: 30 }}>
            <Button
              type="primary"
              size="large"
              onClick={handleUpload}
              loading={uploading}
              disabled={fileList.length === 0}
            >
              {uploading ? 'Uploading...' : 'Upload'}
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
