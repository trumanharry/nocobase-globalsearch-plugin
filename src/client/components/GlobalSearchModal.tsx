import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Modal, Input, Table, Button, Space, Typography, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAPIClient } from '@nocobase/client';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

interface SearchResult {
  id: string | number;
  name: string;
  collectionName: string;
  displayName: string;
  urlTemplate: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<Props> = ({ open, onClose }) => {
  const api = useAPIClient();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<any>(null);
  const requestIdRef = useRef(0);

  const runSearch = useCallback(
    async (raw: string) => {
      const nextQuery = raw?.trim() ?? '';
      if (!nextQuery || nextQuery.length < MIN_QUERY_LENGTH) {
        requestIdRef.current += 1;
        setResults([]);
        setSearched(false);
        setLoading(false);
        return;
      }

      const requestId = ++requestIdRef.current;
      setLoading(true);
      setSearched(true);
      try {
        const res = await api.request({
          url: 'globalSearch:search',
          method: 'GET',
          params: { q: nextQuery },
        });
        if (requestId !== requestIdRef.current) {
          return;
        }
        // NocoBase's dataWrapping middleware wraps ctx.body in { data: ... },
        // so the array lives at res.data.data. Guard with Array.isArray so that
        // a mis-shaped response never passes a non-array to the Table's dataSource.
        const payload = res?.data?.data;
        setResults(Array.isArray(payload) ? payload : []);
      } catch {
        if (requestId !== requestIdRef.current) {
          return;
        }
        setResults([]);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [api],
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    const timer = window.setTimeout(() => {
      runSearch(query);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [open, query, runSearch]);

  const resetState = () => {
    requestIdRef.current += 1;
    setQuery('');
    setResults([]);
    setSearched(false);
    setLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const buildUrl = (record: SearchResult): string => {
    return record.urlTemplate
      .replace(/\{id\}/g, String(record.id))
      .replace(/\{collectionName\}/g, record.collectionName);
  };

  const columns: ColumnsType<SearchResult> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Typography.Text>{String(text ?? '')}</Typography.Text>,
    },
    {
      title: 'Collection',
      dataIndex: 'displayName',
      key: 'displayName',
      width: 180,
      render: (text) => <Tag>{text}</Tag>,
    },
    {
      title: 'Action',
      key: 'action',
      width: 140,
      render: (_, record) => {
        const url = buildUrl(record);
        return (
          <Button
            type="primary"
            size="small"
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
            disabled={!url}
            onClick={() => window.open(url, '_blank')}
          >
            View Record
          </Button>
        );
      },
    },
  ];

  return (
    <Modal
      title="Global Search"
      open={open}
      onCancel={handleClose}
      footer={null}
      width={800}
      destroyOnClose
      afterOpenChange={(visible) => {
        if (visible) {
          resetState();
          setTimeout(() => inputRef.current?.focus(), 100);
        }
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Input.Search
          ref={inputRef}
          value={query}
          placeholder="Search across collections… (minimum 2 characters)"
          enterButton="Search"
          loading={loading}
          allowClear
          onChange={(event) => setQuery(event.target.value)}
          onSearch={runSearch}
        />
        {searched && (
          <Table<SearchResult>
            dataSource={results}
            columns={columns}
            rowKey={(r) => `${r.collectionName}-${r.id}`}
            loading={loading}
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
            size="small"
            locale={{ emptyText: 'No results found' }}
          />
        )}
      </Space>
    </Modal>
  );
};
