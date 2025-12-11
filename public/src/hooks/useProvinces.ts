import { useEffect, useState } from 'react';

export interface Province {
  id: string;
  name: string;
  code?: string;
  isDeleted?: boolean;
}

export interface District {
  id: string;
  name: string;
  code?: string;
  provinceId?: string;
  isDeleted?: boolean;
}

export interface UseProvincesState {
  provinces: Province[];
  districts: { [key: string]: District[] };
  loading: boolean;
  error: string | null;
}

export const useProvinces = () => {
  const [state, setState] = useState<UseProvincesState>({
    provinces: [],
    districts: {},
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        
        // Mock data - replace with actual API call if available
        const mockProvinces: Province[] = [
          { id: '01', name: 'Hà Nội' },
          { id: '02', name: 'Hồ Chí Minh' },
          { id: '03', name: 'Hải Phòng' },
          { id: '04', name: 'Đà Nẵng' },
          { id: '05', name: 'Cần Thơ' },
          // Add more provinces as needed
        ];

        const mockDistricts: { [key: string]: District[] } = {
          '01': [
            { id: '0101', name: 'Ba Đình', provinceId: '01' },
            { id: '0102', name: 'Hoàn Kiếm', provinceId: '01' },
            { id: '0103', name: 'Tây Hồ', provinceId: '01' },
          ],
          '02': [
            { id: '0201', name: 'Quận 1', provinceId: '02' },
            { id: '0202', name: 'Quận 2', provinceId: '02' },
            { id: '0203', name: 'Quận 3', provinceId: '02' },
          ],
        };

        setState({
          provinces: mockProvinces,
          districts: mockDistricts,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Lỗi tải danh sách tỉnh/thành phố';
        setState({
          provinces: [],
          districts: {},
          loading: false,
          error: errorMessage,
        });
        console.error('Failed to fetch provinces:', err);
      }
    };

    fetchProvinces();
  }, []);

  const getDistrictsByProvince = (provinceId: string): District[] => {
    return state.districts[provinceId] || [];
  };

  return {
    ...state,
    getDistrictsByProvince,
  };
};
