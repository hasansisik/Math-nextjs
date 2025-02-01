"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "@/redux/store"
import { Formik, Field, FieldArray, Form } from 'formik'
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { updateExam, updateMatching, updatePlacement, updateFraction } from "@/redux/actions/questionActions"

const questionTypes = [
  { value: "Çoktan Seçmeli", label: "Çoktan Seçmeli Test", type: "exams" },
  { value: "Eşleştirme", label: "Eşleştirme Soruları", type: "matchings" },
  { value: "Sıralama", label: "Sıralama Soruları", type: "placements" },
  { value: "Kesir", label: "Kesir Soruları", type: "fractions" },
]

type TestDuzenleContentProps = {
  id: string;
}

export default function TestDuzenleContent({ id }: TestDuzenleContentProps) {
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const { questions: tests } = useSelector((state: RootState) => state.question)
  const dispatch = useDispatch()
  const { toast } = useToast()

  const test = tests?.find((item) => {
    if (item.exams && item.exams._id === id) {
      return item.exams;
    }
    if (item.matching && item.matching._id === id) {
      return item.matching;
    }
    if (item.placement && item.placement._id === id) {
      return item.placement;
    }
    if (item.fraction && item.fraction._id === id) {
      return item.fraction;
    }
    return false;
  });

  // Rest of your component logic here...
  
  return (
    // Your existing JSX here...
    <div>Content</div>
  )
}
