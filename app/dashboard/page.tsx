"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { getQuestions } from "@/redux/actions/questionActions";
import { CellAction } from "@/components/cell-action";

export default function TestlerimPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const { questions: tests, loading } = useSelector((state: RootState) => state.question);

  useEffect(() => {
    dispatch(getQuestions());
  }, [dispatch]);

  const getAllTests = () => {
    if (!tests) return [];
    
    const allTests: any[] = [];
    tests.forEach((item) => {
      if (item.exams) allTests.push(item.exams);
      if (item.matching) allTests.push(item.matching);
      if (item.placement) allTests.push(item.placement);
      if (item.fraction) allTests.push(item.fraction);
    });
    return allTests;
  };

  const filteredTests = getAllTests().filter((test) =>
    test?.title?.toLowerCase().includes(searchTerm?.toLowerCase() || '') || ''
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        {/* <CircularProgress /> */}
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Testlerim</h2>
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/test-ekle" passHref>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Test
            </Button>
          </Link>
        </div>
      </div>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Test Listesi</CardTitle>
            <CardDescription>
              Tüm testlerinizi buradan görüntüleyebilir ve yönetebilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Test ara..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Adı</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Soru Sayısı</TableHead>
                    <TableHead>Doğruluk Oranı</TableHead>
                    <TableHead>Tamamlanma Oranı</TableHead>
                    <TableHead>Oluşturulma Tarihi</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTests.map((test) => (
                    <TableRow 
                      key={test._id}
                      className="cursor-pointer"
                    >
                      <TableCell>{test.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{test.category || test.title}</Badge>
                      </TableCell>
                      <TableCell>{test.questionsCount}</TableCell>
                      <TableCell>{test.accuracy}%</TableCell>
                      <TableCell>{test.completionRate}%</TableCell>
                      <TableCell>
                        {test.createdAt ? format(new Date(test.createdAt), 'dd MMMM yyyy', { locale: tr }) : '-'}
                      </TableCell>
                      <TableCell>
                        <CellAction data={test} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
