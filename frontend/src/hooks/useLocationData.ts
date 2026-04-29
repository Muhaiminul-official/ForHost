import { useState, useEffect } from 'react';

export function useLocationData(selectedDivision: string, selectedDistrict: string) {
  const [divisions, setDivisions] = useState<{division: string}[]>([]);
  const [districts, setDistricts] = useState<{district: string, upazilla: string[]}[]>([]);
  const [upazilas, setUpazilas] = useState<string[]>([]);

  const [loadingDivisions, setLoadingDivisions] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  useEffect(() => {
    fetch('https://bdapis.com/api/v1.2/divisions')
      .then(res => res.json())
      .then(data => {
        setDivisions(data.data);
        setLoadingDivisions(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingDivisions(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedDivision || selectedDivision === 'All Divisions') {
      setDistricts([]);
      return;
    }
    setLoadingDistricts(true);
    fetch(`https://bdapis.com/api/v1.2/division/${selectedDivision.toLowerCase()}`)
      .then(res => res.json())
      .then(data => {
        setDistricts(data.data);
        setLoadingDistricts(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingDistricts(false);
      });
  }, [selectedDivision]);

  useEffect(() => {
    if (!selectedDistrict || selectedDistrict === 'All Districts') {
      setUpazilas([]);
      return;
    }
    const districtData = districts.find(d => d.district === selectedDistrict);
    if (districtData) {
      setUpazilas(districtData.upazilla);
    } else {
      setUpazilas([]);
    }
  }, [selectedDistrict, districts]);

  return {
    divisions,
    districts,
    upazilas,
    loadingDivisions,
    loadingDistricts
  };
}
