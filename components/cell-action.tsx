'use client';

import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Edit, EllipsisVertical, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { deleteExam, deleteMatching, deleteFraction, deletePlacement, getQuestions } from '@/redux/actions/questionActions';
import { toast } from '@/hooks/use-toast';
import { AppDispatch } from "@/redux/store";

interface CellActionProps {
  data: any;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const onConfirm = async () => {
    try {
      setLoading(true);      
      // Determine which delete action to use based on the category
      switch (data.category) {
        case 'Çoktan Seçmeli':
          await dispatch(deleteExam(data._id));
          break;
        case 'Kesir':
          await dispatch(deleteFraction(data._id));
          break;
        case 'Eşleştirme':
          await dispatch(deleteMatching(data._id));
          break;
        case 'Sıralama':
          await dispatch(deletePlacement(data._id));
          break;
        default:
          throw new Error('Invalid category');
      }
      
      // Refresh the questions data after successful deletion
      await dispatch(getQuestions());
      setOpen(false);
      toast({
        title: 'Başarılı!',
        description: 'Test başarıyla silindi.',
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: 'Hata!',
        description: 'Bir şeyler yanlış gitti.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Menü Aç</span>
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksiyonlar</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/test-duzenle/${data._id}`)}
          >
            <Edit className="mr-2 h-4 w-4" /> Güncelle
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" /> Sil
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
