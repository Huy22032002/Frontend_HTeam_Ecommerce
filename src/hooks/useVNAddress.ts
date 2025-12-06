import axios from "axios";
import { useEffect, useState } from "react";

export const useAddress = () => {
  const [provinces, setProvinces] = useState<{ id: string; name: string }[]>(
    []
  );
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>(
    []
  );
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  useEffect(() => {
    setLoadingProvinces(true);
    axios
      .get("https://api.vnappmob.com/api/v2/province")
      .then((resp) => setProvinces(resp.data.results))
      .catch((err: Error) => console.error(err))
      .finally(() => setLoadingProvinces(false));
  }, []);

  const fetchDistricts = (provinceId: string) => {
    setLoadingDistricts(true);
    axios
      .get(`https://api.vnappmob.com/api/v2/province/district/${provinceId}`)
      .then((resp) => setDistricts(resp.data.results))
      .catch((err) => console.error(err))
      .finally(() => setLoadingDistricts(false));
  };
  return {
    provinces,
    districts,
    fetchDistricts,
    loadingProvinces,
    loadingDistricts,
  };
};
