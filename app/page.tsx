"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

// Firebase configuration - replace with your own config
const firebaseConfig = {
  apiKey: "AIzaSyDujLUK8v7MG3YDowbdNm6_KdDEU0XrpoI",
  authDomain: "scout-festival-2025.firebaseapp.com",
  projectId: "scout-festival-2025",
  storageBucket: "scout-festival-2025.firebasestorage.app",
  messagingSenderId: "185478183601",
  appId: "1:185478183601:web:be1dd429aae3eae609c090",
  measurementId: "G-NTYYE6M9JR",
};
const collectionName = "registrations";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Sign in anonymously
signInAnonymously(auth)
  .then(() => {
    console.log("Signed in anonymously");
  })
  .catch((error) => {
    console.error("Anonymous sign-in error:", error);
  });

interface FormData {
  relativeName: string;
  scouterName: string;
  scouterStage: string;
  relation: string;
  relativePhone: string;
  scouterPhone: string;
  paymentStatus: string;
  remainingMoney: string;
  paymentMethod: string;
}

const DataCollectionApp: React.FC = () => {
  const [activeView, setActiveView] = useState<"form" | "table">("form");
  const [formData, setFormData] = useState<FormData>({
    relativeName: "",
    scouterName: "",
    scouterStage: "",
    relation: "",
    relativePhone: "",
    scouterPhone: "",
    paymentStatus: "",
    remainingMoney: "",
    paymentMethod: "",
  });
  const [customRelation, setCustomRelation] = useState<string>("");
  const [submittedData, setSubmittedData] = useState<FormData[]>([]);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [searchTerm, setSearchTerm] = useState<string>("");

  const loadDataFromFirestore = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const firestoreData: FormData[] = [];
      querySnapshot.forEach((doc) => {
        firestoreData.push(doc.data() as FormData);
      });
      setSubmittedData(firestoreData);
      return true;
    } catch (error) {
      console.error("Error loading data from Firestore:", error);
      return false;
    }
  };
  
  useEffect(() => {
    // // Load data from localStorage on component mount
    // const savedData = localStorage.getItem("scouterData");
    // if (savedData) {
    //   setSubmittedData(JSON.parse(savedData));
    // }

    // Load data from Firestore

    loadDataFromFirestore();
  }, []);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // If relation is changed and it's not "Other", clear customRelation
    if (field === "relation" && value !== "Other") {
      setCustomRelation("");
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.relativeName.trim()) newErrors.relativeName = "Relative name is required";
    if (!formData.scouterName.trim()) newErrors.scouterName = "Scouter name is required";
    if (!formData.scouterStage) newErrors.scouterStage = "Scouter stage is required";
    if (!formData.relation.trim()) newErrors.relation = "Relation is required";
    if (!formData.relativePhone.trim()) newErrors.relativePhone = "Relative phone is required";
    if (!formData.scouterPhone.trim()) newErrors.scouterPhone = "Scouter phone is required";
    if (!formData.paymentStatus) newErrors.paymentStatus = "Payment status is required";
    if (!formData.paymentMethod) newErrors.paymentMethod = "Payment method is required";
    if (formData.paymentStatus === "Partial" && !formData.remainingMoney.trim()) {
      newErrors.remainingMoney = "Remaining money is required for partial payment";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Use custom relation if "Other" is selected and customRelation has value
    const finalFormData = {
      ...formData,
      relation: formData.relation === "Other" && customRelation ? customRelation : formData.relation,
    };

    if (validateForm()) {
      try {
        // Save to Firestore
        await addDoc(collection(db, collectionName), {
          ...finalFormData,
          createdAt: new Date(),
        });

        // // Also save to local state and localStorage for immediate UI update
        // const newData = [...submittedData, finalFormData];
        // setSubmittedData(newData);
        // localStorage.setItem("scouterData", JSON.stringify(newData));

        // Reset form
        setFormData({
          relativeName: "",
          scouterName: "",
          scouterStage: "",
          relation: "",
          relativePhone: "",
          scouterPhone: "",
          paymentStatus: "",
          remainingMoney: "",
          paymentMethod: "",
        });
        setCustomRelation("");

        alert("Data submitted successfully and saved to database!");
      } catch (error) {
        console.error("Error saving data to Firestore:", error);
        alert("Error saving data. Please try again.");
      }
    }
  };

  const renderForm = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Scouter and Relatives Data</CardTitle>
        <CardDescription>Please fill in all the required information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="relativeName">Relative Name *</Label>
              <Input id="relativeName" value={formData.relativeName} onChange={(e) => handleInputChange("relativeName", e.target.value)} className={errors.relativeName ? "border-destructive" : ""} />
              {errors.relativeName && <p className="text-destructive text-sm">{errors.relativeName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="scouterName">Scouter Name *</Label>
              <Input id="scouterName" value={formData.scouterName} onChange={(e) => handleInputChange("scouterName", e.target.value)} className={errors.scouterName ? "border-destructive" : ""} />
              {errors.scouterName && <p className="text-destructive text-sm">{errors.scouterName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="scouterStage">Scouter Stage *</Label>
              <Select value={formData.scouterStage} onValueChange={(value) => handleInputChange("scouterStage", value)}>
                <SelectTrigger className={errors.scouterStage ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kashaf">Kashaf</SelectItem>
                  <SelectItem value="Motaqadem">Motaqadem</SelectItem>
                  <SelectItem value="Gawala">Gawala</SelectItem>
                </SelectContent>
              </Select>
              {errors.scouterStage && <p className="text-destructive text-sm">{errors.scouterStage}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="relation">Relation *</Label>
              <Select value={formData.relation} onValueChange={(value) => handleInputChange("relation", value)}>
                <SelectTrigger className={errors.relation ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select relation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Father">Father</SelectItem>
                  <SelectItem value="Mother">Mother</SelectItem>
                  <SelectItem value="Sibling">Sibling</SelectItem>
                  <SelectItem value="Cousin">Cousin</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.relation && <p className="text-destructive text-sm">{errors.relation}</p>}
              {formData.relation === "Other" && (
                <div className="mt-2">
                  <Input placeholder="Specify relation" value={customRelation} onChange={(e) => setCustomRelation(e.target.value)} className={errors.relation ? "border-destructive" : ""} />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="relativePhone">Relative Phone Number *</Label>
              <Input
                id="relativePhone"
                type="tel"
                value={formData.relativePhone}
                onChange={(e) => handleInputChange("relativePhone", e.target.value)}
                className={errors.relativePhone ? "border-destructive" : ""}
              />
              {errors.relativePhone && <p className="text-destructive text-sm">{errors.relativePhone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="scouterPhone">Scouter Phone Number *</Label>
              <Input
                id="scouterPhone"
                type="tel"
                value={formData.scouterPhone}
                onChange={(e) => handleInputChange("scouterPhone", e.target.value)}
                className={errors.scouterPhone ? "border-destructive" : ""}
              />
              {errors.scouterPhone && <p className="text-destructive text-sm">{errors.scouterPhone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentStatus">Payment Status *</Label>
              <Select value={formData.paymentStatus} onValueChange={(value) => handleInputChange("paymentStatus", value)}>
                <SelectTrigger className={errors.paymentStatus ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full">Full</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                </SelectContent>
              </Select>
              {errors.paymentStatus && <p className="text-destructive text-sm">{errors.paymentStatus}</p>}
              {formData.paymentStatus === "Partial" && (
                <div className="mt-2">
                  <Label htmlFor="remainingMoney">Remaining Money</Label>
                  <Input id="remainingMoney" type="number" placeholder="Enter remaining amount" value={formData.remainingMoney} onChange={(e) => handleInputChange("remainingMoney", e.target.value)} />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange("paymentMethod", value)}>
                <SelectTrigger className={errors.paymentMethod ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Instapay">Instapay</SelectItem>
                </SelectContent>
              </Select>
              {errors.paymentMethod && <p className="text-destructive text-sm">{errors.paymentMethod}</p>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => setActiveView("table")}>
              View Data
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  const renderTable = () => {
    const filteredData = submittedData.filter((data) => data.relativeName.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>Registered members</CardTitle>
          <CardDescription>All collected information</CardDescription>
        </CardHeader>
        <CardContent>
          {submittedData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No data submitted yet.</p>
              <Button className="mt-4" onClick={() => setActiveView("form")}>
                Go to Form
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="relative max-w-sm">
                    <Input placeholder="Search by relative name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-8" />
                    {searchTerm && (
                      <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setSearchTerm("")}>
                        ×
                      </button>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const res = await loadDataFromFirestore();
                      if (!res) {
                        alert("Error fetching data. Please try again.");
                      }
                    }}
                  >
                    Refresh Data
                  </Button>
                </div>
                {searchTerm && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Showing {filteredData.length} of {submittedData.length} records
                  </p>
                )}
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Relative Name</TableHead>
                      <TableHead>Scouter Name</TableHead>
                      <TableHead>Scouter Stage</TableHead>
                      <TableHead>Relation</TableHead>
                      <TableHead>Relative Phone</TableHead>
                      <TableHead>Scouter Phone</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Remaining Money</TableHead>
                      <TableHead>Payment Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No matching records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredData.map((data, index) => (
                        <TableRow key={index}>
                          <TableCell>{data.relativeName}</TableCell>
                          <TableCell>{data.scouterName}</TableCell>
                          <TableCell>{data.scouterStage}</TableCell>
                          <TableCell>{data.relation}</TableCell>
                          <TableCell>{data.relativePhone}</TableCell>
                          <TableCell>{data.scouterPhone}</TableCell>
                          <TableCell>{data.paymentStatus}</TableCell>
                          <TableCell>{data.remainingMoney}</TableCell>
                          <TableCell>{data.paymentMethod}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => setActiveView("form")}>
                  Add More Data
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <img src="logo.JPG" alt="Markoura Scout" className="w-24 h-24 md:w-32 md:h-32 rounded-lg object-cover" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Markoura Festival 2025</h1>
          <p className="text-muted-foreground">Registration</p>
        </header>

        <nav className="flex justify-center mb-8">
          <div className="flex space-x-2 p-1 bg-muted rounded-lg">
            <Button variant={activeView === "form" ? "default" : "ghost"} onClick={() => setActiveView("form")} className="rounded-md">
              Data Entry Form
            </Button>
            <Button variant={activeView === "table" ? "default" : "ghost"} onClick={() => setActiveView("table")} className="rounded-md">
              View Data
            </Button>
          </div>
        </nav>

        <main>{activeView === "form" ? renderForm() : renderTable()}</main>
      </div>
    </div>
  );
};

export default DataCollectionApp;
