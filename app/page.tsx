"use client";
import { useState, useEffect } from "react";
import categories from "./data/categories.json";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";
import CircularProgress from "@/components/ui/CircularProgress";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { getQuestions } from "@/redux/actions/questionActions";
import { Loader2 } from "lucide-react";

interface QuestionItem {
  exams?: ExamType;
  matching?: MatchingType;
  placement?: PlacementType;
  fraction?: FractionType;
}

interface ExamType {
  accuracy: number;
  completionRate: number;
  category: string;
  createdAt: string;
  questionsCount: number;
  _id: string;
  title: string;
}

interface MatchingType extends ExamType {}
interface PlacementType extends ExamType {}
interface FractionType extends ExamType {}

interface ProcessedQuestions {
  exams: ExamType[];
  matching: MatchingType[];
  placement: PlacementType[];
  fraction: FractionType[];
}

export default function Home() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { questions, loading } = useSelector((state: RootState) => state.question);

  useEffect(() => {
    dispatch(getQuestions());
  }, [dispatch]);

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  const processQuestions = (questions: QuestionItem[]): ProcessedQuestions => {
    return questions.reduce((acc: Partial<ProcessedQuestions>, item: QuestionItem) => {
      if (item.exams) {
        acc.exams = [...(acc.exams || []), item.exams];
      }
      if (item.matching) {
        acc.matching = [...(acc.matching || []), item.matching];
      }
      if (item.placement) {
        acc.placement = [...(acc.placement || []), item.placement];
      }
      if (item.fraction) {
        acc.fraction = [...(acc.fraction || []), item.fraction];
      }
      return acc;
    }, {}) as ProcessedQuestions;
  };

  const processedQuestions = questions ? processQuestions(questions) : {} as ProcessedQuestions;
  const { exams = [], matching = [], placement = [], fraction = [] } = processedQuestions;

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center flex-col gap-2">
        <Loader2 className="h-12 w-12 animate-spin text-green-500" />
        <span>Yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Tab Bar */}
      <div className="border-b">
        <nav className="mx-auto px-7 pt-4">
          <ul className="flex space-x-8 overflow-x-auto">
            {categories.categories.map((category) => (
              <li key={category.id}>
                <button
                  onClick={() => handleFilterChange(category.filter)}
                  className={`inline-flex items-center px-1 pt-1 pb-2 text-sm font-medium border-b-2 ${
                    selectedFilter === category.filter
                      ? "border-green-500 text-green-600 dark:text-green-400"
                      : "border-transparent text-gray-800 hover:text-black hover:border-black dark:text-gray-800 dark:hover:text-gray-800"
                  }`}
                >
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {/* Mevcut içerik */}
      <div className="flex p-8">
        <main className="flex flex-col items-center gap-8 w-full">
          {selectedFilter === "exam" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
              {/* Sınavlar Kartı */}
              {exams.map((exam) => (
                <Card
                  key={exam._id}
                  className="flex-1 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/exam/${exam._id}`)}
                >
                  <CardHeader>
                    <div className="relative w-full h-32 mb-4">
                      <Image
                        src="/examBanner.jpg"
                        alt="Course Image"
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg"
                      />
                    </div>
                    <CardTitle>{exam.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <div className="flex justify-between">
                        <div className="flex text-center flex-row gap-4">
                          <CircularProgress
                            value={exam.accuracy}
                            color="#34d399"
                          />
                          <div>
                            <p>Zorluk</p>
                            <p>{exam.accuracy}%</p>
                          </div>
                        </div>
                        <div className="flex text-center flex-row  gap-2">
                          <CircularProgress
                            value={exam.completionRate}
                            color="#34d399"
                          />
                          <div>
                            <p>Başarı Yüzdesi</p>
                            <p>{exam.completionRate}%</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between mt-4">
                        <p className="px-4 py-1 bg-gray-100 rounded-full w-fit">
                          {exam.category === "Kesir" ? "Cevap Yazma" : exam.category}
                        </p>
                        <div className="pt-4 flex flex-row justify-between">
                          <p className="text-base">
                            Oluşturulma tarihi:{" "}
                            {format(new Date(exam.createdAt), "dd/MM/yyyy")}
                          </p>
                          <p>Soru Sayısı: {exam.questionsCount}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {selectedFilter === "matching" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
              {/* Sınavlar Kartı */}
              {matching.map((match) => (
                <Card
                  key={match._id}
                  className="flex-1 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/matching/${match._id}`)}
                >
                  <CardHeader>
                    <div className="relative w-full h-32 mb-4">
                      <Image
                        src="/examBanner2.jpg"
                        alt="Course Image"
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg"
                      />
                    </div>
                    <CardTitle>{match.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <div className="flex justify-between">
                        <div className="flex text-center flex-row gap-4">
                          <CircularProgress
                            value={match.accuracy}
                            color="#34d399"
                          />
                          <div>
                            <p>Zorluk</p>
                            <p>{match.accuracy}%</p>
                          </div>
                        </div>
                        <div className="flex text-center flex-row  gap-2">
                          <CircularProgress
                            value={match.completionRate}
                            color="#34d399"
                          />
                          <div>
                            <p>Başarı Yüzdesi</p>
                            <p>{match.completionRate}%</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between mt-4">
                        <p className="px-4 py-1 bg-gray-100 rounded-full w-fit">
                          {match.category === "Kesir" ? "Cevap Yazma" : match.category}
                        </p>
                        <div className="pt-4 flex flex-row justify-between">
                          <p className="text-base">
                            Oluşturulma tarihi:{" "}
                            {format(new Date(match.createdAt), "dd/MM/yyyy")}
                          </p>
                          <p>Soru Sayısı: {match.questionsCount}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {selectedFilter === "placement" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
              {/* Sınavlar Kartı */}
              {placement.map((place) => (
                <Card
                  key={place._id}
                  className="flex-1 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/placement/${place._id}`)}
                >
                  <CardHeader>
                    <div className="relative w-full h-32 mb-4">
                      <Image
                        src="/examBanner1.jpg"
                        alt="Course Image"
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg"
                      />
                    </div>
                    <CardTitle>{place.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <div className="flex justify-between">
                        <div className="flex text-center flex-row gap-4">
                          <CircularProgress
                            value={place.accuracy}
                            color="#34d399"
                          />
                          <div>
                            <p>Zorluk</p>
                            <p>{place.accuracy}%</p>
                          </div>
                        </div>
                        <div className="flex text-center flex-row  gap-2">
                          <CircularProgress
                            value={place.completionRate}
                            color="#34d399"
                          />
                          <div>
                            <p>Başarı Yüzdesi</p>
                            <p>{place.completionRate}%</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between mt-4">
                        <p className="px-4 py-1 bg-gray-100 rounded-full w-fit">
                          {place.category === "Kesir" ? "Cevap Yazma" : place.category}
                        </p>
                        <div className="pt-4 flex flex-row justify-between">
                          <p className="text-base">
                            Oluşturulma tarihi:{" "}
                            {format(new Date(place.createdAt), "dd/MM/yyyy")}
                          </p>
                          <p>Soru Sayısı: {place.questionsCount}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {selectedFilter === "fraction" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
              {fraction.map((frac) => (
                <Card
                  key={frac._id}
                  className="flex-1 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/fraction/${frac._id}`)}
                >
                  <CardHeader>
                    <div className="relative w-full h-32 mb-4">
                      <Image
                        src="/examBanner3.jpg"
                        alt="Course Image"
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg"
                      />
                    </div>
                    <CardTitle>{frac.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <div className="flex justify-between">
                        <div className="flex text-center flex-row gap-4">
                          <CircularProgress
                            value={frac.accuracy}
                            color="#34d399"
                          />
                          <div>
                            <p>Zorluk</p>
                            <p>{frac.accuracy}%</p>
                          </div>
                        </div>
                        <div className="flex text-center flex-row  gap-2">
                          <CircularProgress
                            value={frac.completionRate}
                            color="#34d399"
                          />
                          <div>
                            <p>Başarı Yüzdesi</p>
                            <p>{frac.completionRate}%</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between mt-4">
                        <p className="px-4 py-1 bg-gray-100 rounded-full w-fit">
                          {frac.category === "Kesir" ? "Cevap Yazma" : frac.category}
                        </p>
                        <div className="pt-4 flex flex-row justify-between">
                          <p className="text-base">
                            Oluşturulma tarihi:{" "}
                            {format(new Date(frac.createdAt), "dd/MM/yyyy")}
                          </p>
                          <p>Soru Sayısı: {frac.questionsCount}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {selectedFilter === "all" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
              {/* Exam Cards */}
              {exams.map((exam) => (
                <Card
                  key={exam._id}
                  className="flex-1 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/exam/${exam._id}`)}
                >
                  <CardHeader>
                    <div className="relative w-full h-32 mb-4">
                      <Image
                        src="/examBanner.jpg"
                        alt="Course Image"
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg"
                      />
                    </div>
                    <CardTitle>{exam.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <div className="flex justify-between">
                        <div className="flex text-center flex-row gap-4">
                          <CircularProgress
                            value={exam.accuracy}
                            color="#34d399"
                          />
                          <div>
                            <p>Zorluk</p>
                            <p>{exam.accuracy}%</p>
                          </div>
                        </div>
                        <div className="flex text-center flex-row  gap-2">
                          <CircularProgress
                            value={exam.completionRate}
                            color="#34d399"
                          />
                          <div>
                            <p>Başarı Yüzdesi</p>
                            <p>{exam.completionRate}%</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between mt-4">
                        <p className="px-4 py-1 bg-gray-100 rounded-full w-fit">
                          {exam.category === "Kesir" ? "Cevap Yazma" : exam.category}
                        </p>
                        <div className="pt-4 flex flex-row justify-between">
                          <p className="text-base">
                            Oluşturulma tarihi:{" "}
                            {format(new Date(exam.createdAt), "dd/MM/yyyy")}
                          </p>
                          <p>Soru Sayısı: {exam.questionsCount}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {/* Matching Cards */}
              {matching.map((match) => (
                <Card
                  key={match._id}
                  className="flex-1 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/matching/${match._id}`)}
                >
                  <CardHeader>
                    <div className="relative w-full h-32 mb-4">
                      <Image
                        src="/examBanner2.jpg"
                        alt="Course Image"
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg"
                      />
                    </div>
                    <CardTitle>{match.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <div className="flex justify-between">
                        <div className="flex text-center flex-row gap-4">
                          <CircularProgress
                            value={match.accuracy}
                            color="#34d399"
                          />
                          <div>
                            <p>Zorluk</p>
                            <p>{match.accuracy}%</p>
                          </div>
                        </div>
                        <div className="flex text-center flex-row  gap-2">
                          <CircularProgress
                            value={match.completionRate}
                            color="#34d399"
                          />
                          <div>
                            <p>Başarı Yüzdesi</p>
                            <p>{match.completionRate}%</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between mt-4">
                        <p className="px-4 py-1 bg-gray-100 rounded-full w-fit">
                          {match.category === "Kesir" ? "Cevap Yazma" : match.category}
                        </p>
                        <div className="pt-4 flex flex-row justify-between">
                          <p className="text-base">
                            Oluşturulma tarihi:{" "}
                            {format(new Date(match.createdAt), "dd/MM/yyyy")}
                          </p>
                          <p>Soru Sayısı: {match.questionsCount}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {/* Placement Cards */}
              {placement.map((place) => (
                <Card
                  key={place._id}
                  className="flex-1 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/placement/${place._id}`)}
                >
                  <CardHeader>
                    <div className="relative w-full h-32 mb-4">
                      <Image
                        src="/examBanner1.jpg"
                        alt="Course Image"
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg"
                      />
                    </div>
                    <CardTitle>{place.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <div className="flex justify-between">
                        <div className="flex text-center flex-row gap-4">
                          <CircularProgress
                            value={place.accuracy}
                            color="#34d399"
                          />
                          <div>
                            <p>Zorluk</p>
                            <p>{place.accuracy}%</p>
                          </div>
                        </div>
                        <div className="flex text-center flex-row  gap-2">
                          <CircularProgress
                            value={place.completionRate}
                            color="#34d399"
                          />
                          <div>
                            <p>Başarı Yüzdesi</p>
                            <p>{place.completionRate}%</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between mt-4">
                        <p className="px-4 py-1 bg-gray-100 rounded-full w-fit">
                          {place.category === "Kesir" ? "Cevap Yazma" : place.category}
                        </p>
                        <div className="pt-4 flex flex-row justify-between">
                          <p className="text-base">
                            Oluşturulma tarihi:{" "}
                            {format(new Date(place.createdAt), "dd/MM/yyyy")}
                          </p>
                          <p>Soru Sayısı: {place.questionsCount}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {/* Fraction Cards */}
              {fraction.map((frac) => (
                <Card
                  key={frac._id}
                  className="flex-1 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/fraction/${frac._id}`)}
                >
                  <CardHeader>
                    <div className="relative w-full h-32 mb-4">
                      <Image
                        src="/examBanner3.jpg"
                        alt="Course Image"
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg"
                      />
                    </div>
                    <CardTitle>{frac.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <div className="flex justify-between">
                        <div className="flex text-center flex-row gap-4">
                          <CircularProgress
                            value={frac.accuracy}
                            color="#34d399"
                          />
                          <div>
                            <p>Zorluk</p>
                            <p>{frac.accuracy}%</p>
                          </div>
                        </div>
                        <div className="flex text-center flex-row  gap-2">
                          <CircularProgress
                            value={frac.completionRate}
                            color="#34d399"
                          />
                          <div>
                            <p>Başarı Yüzdesi</p>
                            <p>{frac.completionRate}%</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between mt-4">
                        <p className="px-4 py-1 bg-gray-100 rounded-full w-fit">
                          {frac.category === "Kesir" ? "Cevap Yazma" : frac.category}
                        </p>
                        <div className="pt-4 flex flex-row justify-between">
                          <p className="text-base">
                            Oluşturulma tarihi:{" "}
                            {format(new Date(frac.createdAt), "dd/MM/yyyy")}
                          </p>
                          <p>Soru Sayısı: {frac.questionsCount}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
