import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';


export const formatDate = (date: Date) => format(
  date,
  'dd MMM yyyy',
  {
    locale: ptBR,
  }
)
