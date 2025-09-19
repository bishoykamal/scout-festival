import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState, useEffect } from "react";
import { db, collectionName, collection, getDocs } from "@/lib/firebase";

interface TableProps {
  setActiveView: any;
}

interface RelativeData {
  name: string;
  relation: string;
  phone: string;
  customRelation: string;
}

interface reservationData {
  scouterName: string;
  scouterStage: string;
  scouterPhone: string;
  paymentStatus: string;
  remainingMoney: string;
  paymentMethod: string;
  relatives: RelativeData[];
}

export const DataTable: React.FC<TableProps> = ({ setActiveView }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [submittedData, setSubmittedData] = useState<reservationData[]>([]);

  const filteredData = submittedData.filter((data: any) => data.scouterPhone.toLowerCase().includes(searchTerm.toLowerCase()));

  const loadDataFromFirestore = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const firestoreData: reservationData[] = [];
      querySnapshot.forEach((doc) => {
        console.log(doc.data());
        firestoreData.push(doc.data() as reservationData);
      });
      setSubmittedData(firestoreData);
      return true;
    } catch (error) {
      console.error("Error loading data from Firestore:", error);
      return false;
    }
  };

  const toggleRowExpansion = (scouterPhone: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(scouterPhone)) {
      newExpanded.delete(scouterPhone);
    } else {
      newExpanded.add(scouterPhone);
    }
    setExpandedRows(newExpanded);
  };

  useEffect(() => {
    loadDataFromFirestore();
  }, []);

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
                  <Input placeholder="Search by scouter phone number" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-8" />
                  {searchTerm && (
                    <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setSearchTerm("")}>
                      ×
                    </button>
                  )}
                </div>
                <Button variant="outline" onClick={() => loadDataFromFirestore()}>
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
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Scouter Phone</TableHead>
                    <TableHead>Scouter Name</TableHead>
                    <TableHead>Scouter Stage</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Remaining Money</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Relatives Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((data: reservationData) => (
                    <React.Fragment key={data.scouterPhone}>
                      {/* Main scouter row */}
                      <TableRow className="bg-muted/50">
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-6 w-6 p-0 text-sm font-bold" onClick={() => toggleRowExpansion(data.scouterPhone)}>
                            {expandedRows.has(data.scouterPhone) ? "-" : "+"}
                          </Button>
                        </TableCell>
                        <TableCell>{data.scouterPhone}</TableCell>
                        <TableCell>{data.scouterName}</TableCell>
                        <TableCell>{data.scouterStage}</TableCell>
                        <TableCell>{data.paymentStatus}</TableCell>
                        <TableCell>{data.remainingMoney}</TableCell>
                        <TableCell>{data.paymentMethod}</TableCell>
                        <TableCell>{data.relatives.length}</TableCell>
                      </TableRow>

                      {/* Expanded relatives rows */}
                      {expandedRows.has(data.scouterPhone) && (
                        <>
                          <TableRow className="bg-muted/20">
                            <TableCell colSpan={8} className="p-0">
                              <div className="px-6 py-3">
                                <h4 className="font-medium text-sm mb-2">Relatives:</h4>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Relative Name</TableHead>
                                      <TableHead>Relation</TableHead>
                                      <TableHead>Phone</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {data.relatives.map((relative: RelativeData, index: number) => (
                                      <TableRow key={`${data.scouterPhone}-${index}`}>
                                        <TableCell>{relative.name}</TableCell>
                                        <TableCell>{relative.relation}</TableCell>
                                        <TableCell>{relative.phone}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </TableCell>
                          </TableRow>
                        </>
                      )}
                    </React.Fragment>
                  ))}
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
