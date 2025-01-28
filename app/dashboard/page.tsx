"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2 } from "lucide-react";

// Örnek veri - Bu kısmı kendi API'niz ile değiştirebilirsiniz
export const tests = [
  {
    id: "2025_01_01",
    title: "6.Sınıf Test Soruları",
    accuracy: 40,
    completionRate: 60,
    category: "Çoktan Seçmeli",
    createdAt: "2023-10-01T12:00:00Z",
    questionsCount: 10,
    questions: [
      {
        question:
          "1) Geçilmekte olan araç sürücüsü aşağıdakilerden hangisini yapmalıdır?",
        options: [
          "A) Hızını arttırmalıdır.",
          "B) Bulunduğu şeridi izlemelidir.",
          "C) Önündeki aracı geçmeye çalışmalıdır.",
          "D) Dönüş lambalarıyla geç işareti vermelidir.",
        ],
        correctAnswer: "B",
      },
      {
        question:
          "2) Şekildeki trafik tanzim işaretine göre hangi numaralı araçlar geçme yasağına uymamıştır?",
        image: "https://ehliyetsinavihazirlik.com/images/7-ekim-2017/23.gif",
        options: ["A) Yalnız 3", "B) 1 ve 2", "C) 2 ve 3", "D) 2, 3 ve 4"],
        correctAnswer: "D",
      },
      {
        question:
          "3) Bir sürücünün trafik içindeki istenmeyen durumlara öfkelenmesi ve bu öfkeyi belli etmesi yerine, hangi davranışı göstermesi hâlinde çok daha huzurlu bir trafik ortamı oluşur?",
        options: [
          "A) Hoşgörülü olması",
          "B) Bencil davranması",
          "C) Aşırı stres yapması",
          "D) Sürekli kornaya basması",
        ],
        correctAnswer: "A",
      },
      {
        question:
          "4) Aksine bir durum yoksa, otoyollarda yolcu sepetsiz iki tekerlekli motosikletlerin azami hız sınırı saatte kaç kilometredir?",
        options: ["A) 70", "B) 80", "C) 90", "D) 100"],
        correctAnswer: "C",
      },
      {
        question:
          "5) Aşağıdakilerden hangisinin her periyodik bakımda değiştirilmesi gerekir?",
        options: [
          "A) Polen filtresinin",
          "B) Fren hidroliğinin",
          "C) Araç lastiklerinin",
          "D) Soğutma suyunun",
        ],
        correctAnswer: "A",
      },
      {
        question:
          "6) Ülkemizde, trafik kazalarındaki kusur oranlarının (%) yıllara göre dağılımı tablodaki gibidir. Bu verilere göre aşağıdakilerden hangisi kesinlikle söylenebilir?",
        image:
          "https://ehliyetsinavihazirlik.com/images/sorular/8subat2014ehliyetsorulari/soru36.jpg",
        options: [
          "A) Kazaların çoğu insan kaynaklıdır.",
          "B) Kara yolları, deniz ve hava yollarına göre daha risklidir.",
          "C) Toplu taşıma yapılması ülke ekonomisini olumlu yönde etkiler.",
          "D) Kara yolu ulaşım sistemi, diğer ulaşım sistemlerinden daha çok kullanılmaktadır.",
        ],
        correctAnswer: "A",
      },
      {
        question:
          "7) Geceleri araç kullanırken aydınlatmanın yeterli olduğu yerlerde araç ışıklarından hangisi kullanılmalıdır?",
        options: [
          "A) Sis ışıkları",
          "B) Acil uyarı ışıkları",
          "C) Uzağı gösteren ışıklar",
          "D) Yakını gösteren ışıklar",
        ],
        correctAnswer: "D",
      },
      {
        question:
          "8) I. Hızlarını artırmaları  II. Virajı dar bir kavisle almaları III. Öndeki aracı geçmeleri Görseldeki gibi bir karayolu bölümünde seyreden sürücülerin, numaralanmış davranışlardan hangilerini yapmaları tehlikeli durumların oluşmasına neden olur?",
        image:
          "https://ehliyetsinavihazirlik.com/images/animasyonlu_sorular/27.JPG",
        options: [
          "A) I ve II",
          "B) I ve III",
          "C) II ve III",
          "D) I, II ve III",
        ],
        correctAnswer: "D",
      },
      {
        question:
          "9) Aşağıdakilerden hangisi trafiğin düzenlenmesinde en yüksek önceliğe sahiptir?",
        options: [
          "A) Trafik ışıkları",
          "B) Trafik görevlisi",
          "C) Yer işaretleri",
          "D) Trafik levhaları",
        ],
        correctAnswer: "B",
      },
      {
        question:
          "10) Kaburga kemiğinde kırık olan kazazedeye aşağıdaki pozisyonlardan hangisi verilerek hastaneye sevk edilmelidir?",
        options: [
          "https://ehliyetsinavihazirlik.com/images/sorular/8aralik2013ehliyetsorulari/soru12cevapa.jpg",
          "B) https://ehliyetsinavihazirlik.com/images/sorular/8aralik2013ehliyetsorulari/soru12cevapb.jpg",
          "C) https://ehliyetsinavihazirlik.com/images/sorular/8aralik2013ehliyetsorulari/soru12cevapc.jpg",
          "D) https://ehliyetsinavihazirlik.com/images/sorular/8aralik2013ehliyetsorulari/soru12cevapd.jpg",
        ],
        correctAnswer: "",
      },
    ],
  },
  {
    id: "123124",
    title: "Eşleştirme Soruları",
    accuracy: 40,
    completionRate: 60,
    category: "Eşleştirme",
    createdAt: "2023-10-01T12:00:00Z",
    questionsCount: 10,
    questions: [
      {
        title: "1) Aşağıdaki verilen işlemlerini sonuçları ile eşleştiriniz",
        question: ["6 x 2 - 2", "6 - 5 - 1", "2 x 4 - 2", "0 x 5 + 8"],
        correctAnswer: ["10", "0", "6", "8"],
      },
      {
        title: "2) Aşağıdaki verilen işlemlerini sonuçları ile eşleştiriniz",
        question: [
          "https://i.ibb.co/K66Xsj1/I-want-you-to-make-a-triangle-of-one-color-that-lies-flat.jpg",
          "https://i.ibb.co/TgKz95x/I-want-you-to-make-a-square-of-one-color-that-lies-flat.jpg",
          "https://i.ibb.co/0hVBjdb/I-want-you-to-make-a-circle-of-one-color-that-lies-flat-1.jpg",
        ],
        correctAnswer: ["Üçgen", "Kare", "Daire"],
      },
      {
        title: "3) Aşağıdaki verilen işlemlerini sonuçları ile eşleştiriniz",
        question: [
          "Onyedi milyon yüz iki bin elli dört",
          "Yüz yedi milyon on iki bin beş yüz dört",
          "Yüz yetmiş milyon yüz yirmi bin beş yüz kırk",
        ],
        correctAnswer: [
          "170 210 540",
          "170 120 540",
          "17 120 054",
          "107 012 504",
          "17 120 501",
        ],
      },
    ],
  },
  {
    "id": "1234345",
    "title": "Kesir Soruları",
    "accuracy": 40,
    "completionRate": 60,
    "category": "Kesir",
    "createdAt": "2023-10-01T12:00:00Z",
    "questionsCount": 10,
    "questions": [
      {
        "title": "1) Aşağıdaki tam sayılı kesirleri bileşik kesirlere çeviriniz",
        "question": [
          {
            "mixedFraction": "6x1/2",
            "parts": {
              "A": "6",
              "B": "2",
              "C": "1"
            },
            "answer": "13/2"
          },
          {
            "mixedFraction": "2x3/4",
            "parts": {
              "A": "2",
              "B": "4",
              "C": "3"
            },
            "answer": "11/4"
          },
          {
            "mixedFraction": "4x1/3",
            "parts": {
              "A": "4",
              "B": "3",
              "C": "1"
            },
            "answer": "13/3"
          },
          {
            "mixedFraction": "5x2/5",
            "parts": {
              "A": "5",
              "B": "5",
              "C": "2"
            },
            "answer": "27/5"
          }
        ]
      },
      {
        "title": "1) Aşağıdaki tam sayılı kesirleri bileşik kesirlere çeviriniz",
        "question": [
          {
            "mixedFraction": "6x1/2",
            "parts": {
              "A": "6",
              "B": "2",
              "C": "1"
            },
            "answer": "13/2"
          },
          {
            "mixedFraction": "2x3/4",
            "parts": {
              "A": "2",
              "B": "4",
              "C": "3"
            },
            "answer": "11/4"
          },
          {
            "mixedFraction": "4x1/3",
            "parts": {
              "A": "4",
              "B": "3",
              "C": "1"
            },
            "answer": "13/3"
          },
          {
            "mixedFraction": "5x2/5",
            "parts": {
              "A": "5",
              "B": "5",
              "C": "2"
            },
            "answer": "27/5"
          }
        ]
      }
    ]
  },
  {
    "id": "1234345",
    "title": "Sıralama Soruları",
    "accuracy": 40,
    "completionRate": 60,
    "category": "Sıralama",
    "createdAt": "2023-10-01T12:00:00Z",
    "questionsCount": 10,
    "desc": "2025 Ocak Ayı Sınav-1 Kurstanbul tarafından e-sınav müfredatına uygun olarak hazırlanmıştır.",
    "questions": [
      {
        "type": ">",
        "title": "1) Aşağıdaki sayıları büyükten küçüğe sıralayınız",
        "correctAnswer": [12, 3, -1, -5],
        "direction": "Büyükten küçüğe doğru sıralayınız"
      },
      {
        "type": "<",
        "title": "2) Aşağıdaki sayıları küçükten büyüğe sıralayınız",
        "correctAnswer": [-8, -3, 0, 4, 7],
        "direction": "Küçükten büyüğe doğru sıralayınız"
      }
    ]
  }
];

export default function TestlerimPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTest, setSelectedTest] = useState<(typeof tests)[0] | null>(
    null
  );

  const filteredTests = tests.filter(
    (test) =>
      test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Çoktan Seçmeli":
        return "bg-blue-500";
      case "Eşleştirme":
        return "bg-green-500";
      case "Sıralama":
        return "bg-purple-500";
      case "Kesir":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto ">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Testlerim</CardTitle>
              <CardDescription>
                Oluşturduğunuz tüm testleri buradan yönetebilirsiniz.
              </CardDescription>
            </div>
            <Link href="/dashboard/test-ekle">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Yeni Test Ekle
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Test ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Adı</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Soru Sayısı</TableHead>
                  <TableHead>Oluşturulma Tarihi</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">{test.title}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getCategoryColor(test.category)}
                      >
                        {test.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{test.questionsCount} Soru</TableCell>
                    <TableCell>
                      {format(new Date(test.createdAt), "d MMMM yyyy", {
                        locale: tr,
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/test-duzenle/${test.id}`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Test düzenleme formu komponenti
function TestEditForm({ test }: { test: any }) {
  if (!test) return null;

  return (
    <div className="grid gap-6">
      <div>
        <Label htmlFor="title">Test Başlığı</Label>
        <Input id="title" defaultValue={test.title} className="mt-2" />
      </div>
      <div>
        <Label htmlFor="category">Kategori</Label>
        <Input
          id="category"
          defaultValue={test.category}
          className="mt-2"
          disabled
        />
      </div>
      <div className="flex justify-end gap-4">
        <Button variant="outline">İptal</Button>
        <Button>Değişiklikleri Kaydet</Button>
      </div>
    </div>
  );
}
