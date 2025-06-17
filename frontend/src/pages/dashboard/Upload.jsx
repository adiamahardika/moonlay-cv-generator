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

  // Validasi sebelum file ditambahkan
  const beforeUpload = (file) => {
    const isAllowedType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type);
    const isUnderSizeLimit = file.size / 1024 / 1024 < 5;

    if (!isAllowedType) {
      message.error({
        content: 'Only PDF, DOC, or DOCX files are allowed.',
        style: { fontSize: '18px' },
      });
      return Upload.LIST_IGNORE;
    }

    if (!isUnderSizeLimit) {
      message.error({
        content: 'File size must be less than 5MB.',
        style: { fontSize: '18px' },
      });
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning({
        content: 'Please select a file first.',
        style: { fontSize: '18px' },
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', fileList[0].originFileObj);

    setUploading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/upload/manual`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        message.success({
          content: `Successfully uploaded: ${result.filename}`,
          style: { fontSize: '18px' },
        });
        console.log('File URL:', result.path);
        setFileList([]);
      } else {
        message.error({
          content: result.error || 'Upload failed.',
          style: { fontSize: '18px' },
        });
      }
    } catch (error) {
      console.error(error);
      message.error({
        content: 'Something went wrong while uploading.',
        style: { fontSize: '18px' },
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setFileList([]);
    message.info({
      content: 'Upload has been cleared.',
      style: { fontSize: '18px' },
    });
  };

  return (
    <Row justify="center" align="middle" style={{ height: '100vh', backgroundColor: '#f5f5f5' }}>
      <Col xs={22} sm={18} md={14} lg={10} xl={8}>
        <Card style={{ textAlign: 'center', padding: 32, borderRadius: 12 }} bodyStyle={{ padding: 0 }}>
          <Title level={2} style={{ marginBottom: 30 }}>Upload Manual CV</Title>

          <Upload
            beforeUpload={beforeUpload}
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
