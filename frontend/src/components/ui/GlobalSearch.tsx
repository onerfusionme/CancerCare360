import React, { useState, useMemo } from 'react';
import { AutoComplete, Input, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { patientService } from '@/services/patient.service';
import { debounce } from 'lodash-es';

const { Text } = Typography;

export default function GlobalSearch() {
  const router = useRouter();
  const [options, setOptions] = useState<any[]>([]);

  const searchPatients = useMemo(
    () => debounce(async (val: string) => {
      if (!val || val.length < 2) {
        setOptions([]);
        return;
      }
      try {
        const results = await patientService.searchPatients(val);
        const mappedOpts = results.map(p => ({
          value: p.id,
          label: (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>{p.firstName} {p.lastName}</Text>
              <Text type="secondary">{p.mrn}</Text>
            </div>
          )
        }));
        setOptions(mappedOpts);
      } catch (e) {
        console.error(e);
      }
    }, 500),
    []
  );

  const onSelect = (value: string) => {
    router.push(`/patients/${value}`);
  };

  return (
    <AutoComplete
      options={options}
      style={{ width: '100%' }}
      onSelect={onSelect}
      onSearch={searchPatients}
      placeholder="Search patients by name or MRN"
    >
      <Input prefix={<SearchOutlined style={{ color: '#bfbfbf' }}/>} />
    </AutoComplete>
  );
}
