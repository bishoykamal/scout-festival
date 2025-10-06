"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db, collectionName, collection, addDoc } from "@/lib/firebase";
import { DataTable } from "./table";
import useLocalstorageState from "@/lib/localStorage";

interface RelativeData {
  name: string;
  relation: string;
  phone: string;
  customRelation: string;
}
interface FormData {
  scouterName: string;
  scouterStage: string;
  scouterPhone: string;
  paymentStatus: string;
  remainingMoney: string;
  paymentMethod: string;
  relatives: RelativeData[];
}

const DataCollectionApp: React.FC = () => {
  const [activeView, setActiveView] = useState<"form" | "table">("form");
  const [formData, setFormData] = useState<FormData>({
    scouterName: "",
    scouterStage: "",
    scouterPhone: "",
    paymentStatus: "",
    remainingMoney: "",
    paymentMethod: "",
    relatives: [],
  });
  // const [customRelation, setCustomRelation] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: any }>({});
  const [formState, setFormState] = useLocalstorageState("form_state", { available: false });

  const addRelative = () => {
    setFormData((prev) => ({
      ...prev,
      relatives: [...prev.relatives, { name: "", relation: "", phone: "", customRelation: "" }],
    }));
  };

  const removeRelative = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      relatives: prev.relatives.filter((_, i) => i !== index),
    }));
  };

  const handleRelativeChange = (index: number, field: keyof RelativeData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      relatives: prev.relatives.map((relative, i) => (i === index ? { ...relative, [field]: value } : relative)),
    }));
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // If relation is changed and it's not "Other", clear customRelation
    // if (field === "relation" && value !== "Other") {
    //   setCustomRelation("");
    // }
  };

  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (!formData.scouterName.trim()) newErrors.scouterName = "Scouter name is required";
    if (!formData.scouterStage) newErrors.scouterStage = "Scouter stage is required";
    if (!formData.scouterPhone.trim()) newErrors.scouterPhone = "Scouter phone is required";
    if (!formData.paymentStatus) newErrors.paymentStatus = "Payment status is required";
    if (!formData.paymentMethod) newErrors.paymentMethod = "Payment method is required";
    if (formData.paymentStatus === "Partial" && !formData.remainingMoney.trim()) {
      newErrors.remainingMoney = "Remaining money is required for partial payment";
    }

    // Validate relatives
    formData.relatives.forEach((relative, index) => {
      if (!relative.name.trim()) newErrors[`relativeName-${index}`] = "Relative name is required";
      if (!relative.relation.trim()) newErrors[`relativeRelation-${index}`] = "Relation is required";
      if (!relative.phone.trim()) newErrors[`relativePhone-${index}`] = "Relative phone is required";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Use custom relation if "Other" is selected and customRelation has value
    const finalFormData = {
      ...formData,
      relatives: formData.relatives.map(({ customRelation, relation, ...rest }) => ({
        ...rest,
        relation: relation === "Other" && customRelation ? customRelation : relation,
      })),
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
          scouterName: "",
          scouterStage: "",
          scouterPhone: "",
          paymentStatus: "",
          remainingMoney: "",
          paymentMethod: "",
          relatives: [],
        });
        // setCustomRelation("");

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
        <CardTitle>Scouter Data Collection</CardTitle>
        <CardDescription>Please fill in all the required information</CardDescription>
      </CardHeader>
      {formState.available ? (
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Scouter Information */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-medium mb-4">Scouter Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
            </div>

            {/* Section 2: Payment Information */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-medium mb-4">Payment Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Input
                        id="remainingMoney"
                        type="number"
                        placeholder="Enter remaining amount"
                        value={formData.remainingMoney}
                        onChange={(e) => handleInputChange("remainingMoney", e.target.value)}
                      />
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
            </div>

            {/* Section 3: Relatives Information */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Relatives Information</h3>
                <Button type="button" onClick={addRelative} variant="outline" size="sm">
                  + Add Relative
                </Button>
              </div>

              {formData.relatives.map((relative, index) => (
                <div key={index} className="border rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Relative {index + 1}</h4>
                    {formData.relatives.length > 0 && (
                      <Button type="button" onClick={() => removeRelative(index)} variant="ghost" size="sm" className="text-destructive">
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`relativeName-${index}`}>Relative Name *</Label>
                      <Input
                        id={`relativeName-${index}`}
                        value={relative.name}
                        onChange={(e) => handleRelativeChange(index, "name", e.target.value)}
                        className={errors[`relativeName-${index}`] ? "border-destructive" : ""}
                      />
                      {errors[`relativeName-${index}`] && <p className="text-destructive text-sm">{errors[`relativeName-${index}`]}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`relation-${index}`}>Relation *</Label>
                      <Select value={relative.relation} onValueChange={(value) => handleRelativeChange(index, "relation", value)}>
                        <SelectTrigger className={errors[`relativeRelation-${index}`] ? "border-destructive" : ""}>
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
                      {errors[`relativeRelation-${index}`] && <p className="text-destructive text-sm">{errors[`relativeRelation-${index}`]}</p>}
                      {relative.relation === "Other" && (
                        <div className="mt-2">
                          <Input
                            placeholder="Specify relation"
                            value={relative.customRelation}
                            onChange={(e) => handleRelativeChange(index, "customRelation", e.target.value)}
                            className={errors.relation ? "border-destructive" : ""}
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`relativePhone-${index}`}>Phone Number *</Label>
                      <Input
                        id={`relativePhone-${index}`}
                        type="tel"
                        value={relative.phone}
                        onChange={(e) => handleRelativeChange(index, "phone", e.target.value)}
                        className={errors[`relativePhone-${index}`] ? "border-destructive" : ""}
                      />
                      {errors[`relativePhone-${index}`] && <p className="text-destructive text-sm">{errors[`relativePhone-${index}`]}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </CardContent>
      ) : (
        <CardContent>Thank you for your cooperation, The form is closed.</CardContent>
      )}
    </Card>
  );

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
        <main>{activeView === "form" ? renderForm() : <DataTable setActiveView={(view: any) => setActiveView(view)} />}</main>{" "}
      </div>
    </div>
  );
};

export default DataCollectionApp;
