import React, { useState, useEffect } from 'react';
import './App.css';
import ChartComponent from './Chart';
import LineChartComponent from './LineChartComponent';
import PieChartComponent from './PieChartComponent';
import Login from './Login';
import Signup from './Signup';
import Profile from './Profile';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { exportToCSV, exportToJSON } from './exportData';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const fetchDataFromFirestore = async (uid) => {
  console.log("Fetching data from Firestore for UID:", uid);
  const q = query(collection(db, "carbonData"), where("uid", "==", uid));
  const querySnapshot = await getDocs(q);
  const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  console.log("Data fetched from Firestore:", data);
  return data;
};

const fetchRealData = async (uid) => {
  const apiKey = "VbBoqRlJO6jaW4jJaALA";
  const url = "https://www.carboninterface.com/api/v1/estimates";
  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  };
  const body = JSON.stringify({
    type: "electricity",
    electricity_unit: "mwh",
    electricity_value: 1,
    country: "US"
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: body
  });

  if (response.ok) {
    const data = await response.json();
    console.log("Fetched data from API:", data);
    return {
      uid,
      value: data.data.attributes.carbon_mt.toString(),
      created: new Date().toISOString()
    };
  } else {
    throw new Error("API Error: " + response.statusText);
  }
};

const addDataToFirestore = async (data) => {
  const docRef = await addDoc(collection(db, "carbonData"), data);
  console.log("Document written with ID:", docRef.id);
  return { ...data, id: docRef.id };
};

const App = () => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [theme, setTheme] = useState('light');
  const [showProfile, setShowProfile] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("Auth state changed:", firebaseUser);
      if (firebaseUser) {
        setUser(firebaseUser);
        queryClient.invalidateQueries('carbonData');
      } else {
        setUser(null);
        queryClient.removeQueries('carbonData');
      }
    });

    return () => unsubscribe();
  }, [queryClient]);

  const { data: carbonData, isLoading, error: queryError } = useQuery(
    ['carbonData', user?.uid],
    () => fetchDataFromFirestore(user.uid),
    {
      enabled: !!user,
      onSuccess: (data) => {
        if (data.length === 0) {
          fetchRealData(user.uid).then(freshData => {
            queryClient.setQueryData(['carbonData', user.uid], [freshData]);
            addDataToFirestore(freshData).then(() => toast.success("Real data fetched and added to Firestore"));
          }).catch(fetchError => {
            console.error(fetchError);
            toast.error("Error fetching real data");
          });
        }
      },
      onError: (error) => {
        console.error("Error fetching data:", error);
        toast.error("Error fetching data");
      }
    }
  );

  const mutation = useMutation(addDataToFirestore, {
    onSuccess: (newData) => {
      queryClient.setQueryData(['carbonData', user.uid], (oldData) => [...oldData, newData]);
      toast.success("Data added to Firestore");
    },
    onError: (error) => {
      console.error("Error adding document:", error);
      toast.error("Error adding document");
    }
  });

  const handleAddData = () => {
    if (inputValue.trim() === "") {
      setError("Please enter a valid value.");
      toast.error("Please enter a valid value.");
      return;
    }

    const numericValue = parseFloat(inputValue);
    if (isNaN(numericValue) || numericValue <= 0) {
      setError("Please enter a positive number.");
      toast.error("Please enter a positive number.");
      return;
    }

    setError("");
    mutation.mutate({ uid: user.uid, value: inputValue, created: new Date().toISOString() });
    setInputValue("");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error signing out");
    }
  };

  const getFilteredSortedData = () => {
    if (!carbonData) return [];

    let filteredData = carbonData;

    if (filterStartDate) {
      filteredData = filteredData.filter(data => new Date(data.created) >= new Date(filterStartDate));
    }
    if (filterEndDate) {
      filteredData = filteredData.filter(data => new Date(data.created) <= new Date(filterEndDate));
    }

    if (sortOrder === 'value-asc') {
      filteredData = filteredData.sort((a, b) => parseFloat(a.value) - parseFloat(b.value));
    } else if (sortOrder === 'value-desc') {
      filteredData = filteredData.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
    } else if (sortOrder === 'date-asc') {
      filteredData = filteredData.sort((a, b) => new Date(a.created) - new Date(b.created));
    } else if (sortOrder === 'date-desc') {
      filteredData = filteredData.sort((a, b) => new Date(b.created) - new Date(a.created));
    }

    return filteredData;
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const calculateSummary = () => {
    if (!carbonData || carbonData.length === 0) return {};

    const values = carbonData.map(data => parseFloat(data.value));
    const total = values.reduce((acc, value) => acc + value, 0);
    const average = total / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    return { total, average, max, min };
  };

  const summary = calculateSummary();

  const getExportData = () => {
    return getFilteredSortedData();
  };

  return (
    <div className="container" role="main">
      <ToastContainer />
      <h1 tabIndex="0">Carbon Tracker</h1>
      <button onClick={toggleTheme} aria-label="Toggle Theme">Toggle Theme</button>
      {user ? (
        <>
          <button onClick={handleLogout} aria-label="Logout">Logout</button>
          <button onClick={() => setShowProfile(!showProfile)} aria-label="Toggle Profile View">
            {showProfile ? "Back to Dashboard" : "Update Profile"}
          </button>
          {showProfile ? (
            <Profile user={user} />
          ) : isLoading ? (
            <p>Loading data...</p>
          ) : queryError ? (
            <p>Error loading data: {queryError.message}</p>
          ) : (
            <>
              <label htmlFor="dataInput">Enter carbon emission data:</label>
              <input
                type="text"
                id="dataInput"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter carbon emission data"
                aria-required="true"
              />
              {error && <p style={{ color: 'red' }}>{error}</p>}
              <button onClick={handleAddData} aria-label="Add Data">Add Data</button>
              <button onClick={() => exportToCSV(getExportData())} aria-label="Export to CSV">Export to CSV</button>
              <button onClick={() => exportToJSON(getExportData())} aria-label="Export to JSON">Export to JSON</button>

              <div className="filters" role="region" aria-labelledby="filtersHeading">
                <h2 id="filtersHeading">Filters</h2>
                <label htmlFor="startDate">Start Date:</label>
                <input
                  type="date"
                  id="startDate"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  aria-describedby="startDateDesc"
                />
                <span id="startDateDesc" className="sr-only">Filter data from this start date</span>

                <label htmlFor="endDate">End Date:</label>
                <input
                  type="date"
                  id="endDate"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  aria-describedby="endDateDesc"
                />
                <span id="endDateDesc" className="sr-only">Filter data until this end date</span>

                <h2>Sort By</h2>
                <label htmlFor="sortValueAsc">
                  <input
                    type="radio"
                    id="sortValueAsc"
                    name="sortOrder"
                    value="value-asc"
                    checked={sortOrder === 'value-asc'}
                    onChange={(e) => setSortOrder(e.target.value)}
                    aria-label="Sort by value in ascending order"
                  />
                  Value (Ascending)
                </label>
                <label htmlFor="sortValueDesc">
                  <input
                    type="radio"
                    id="sortValueDesc"
                    name="sortOrder"
                    value="value-desc"
                    checked={sortOrder === 'value-desc'}
                    onChange={(e) => setSortOrder(e.target.value)}
                    aria-label="Sort by value in descending order"
                  />
                  Value (Descending)
                </label>
                <label htmlFor="sortDateAsc">
                  <input
                    type="radio"
                    id="sortDateAsc"
                    name="sortOrder"
                    value="date-asc"
                    checked={sortOrder === 'date-asc'}
                    onChange={(e) => setSortOrder(e.target.value)}
                    aria-label="Sort by date in ascending order"
                  />
                  Date (Ascending)
                </label>
                <label htmlFor="sortDateDesc">
                  <input
                    type="radio"
                    id="sortDateDesc"
                    name="sortOrder"
                    value="date-desc"
                    checked={sortOrder === 'date-desc'}
                    onChange={(e) => setSortOrder(e.target.value)}
                    aria-label="Sort by date in descending order"
                  />
                  Date (Descending)
                </label>
              </div>

              <ul aria-live="polite">
                {getFilteredSortedData().map((data) => (
                  <li key={data.id}>{data.value}</li>
                ))}
              </ul>

              {carbonData.length > 0 && (
                <>
                  <section aria-labelledby="summaryHeading">
                    <h2 id="summaryHeading">Summary</h2>
                    <p>Total: {summary.total?.toFixed(2)}</p>
                    <p>Average: {summary.average?.toFixed(2)}</p>
                    <p>Maximum: {summary.max?.toFixed(2)}</p>
                    <p>Minimum: {summary.min?.toFixed(2)}</p>
                  </section>

                  <ChartComponent carbonData={carbonData} />
                  <LineChartComponent carbonData={carbonData} />
                  <PieChartComponent carbonData={carbonData} />
                </>
              )}
            </>
          )}
        </>
      ) : (
        <>
          {isLogin ? <Login setUser={setUser} /> : <Signup setUser={setUser} />}
          <button onClick={() => setIsLogin(!isLogin)} aria-label="Toggle Sign In/Sign Up">
            {isLogin ? "Need an account? Sign up" : "Already have an account? Login"}
          </button>
        </>
      )}
    </div>
  );
};

export default App;