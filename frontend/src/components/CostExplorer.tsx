import { useEffect, useState } from 'react'
import { Box, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react'
import { API_V1 } from '../config'

export function CostExplorer(){
  const [rows, setRows] = useState<any[]>([])
  useEffect(()=>{
    fetch(`${API_V1}/costs?granularity=day`)
      .then(r => r.json())
      .then((payload) => setRows(payload.data || []))
  },[])
  return (
    <Box>
      <Table size='sm'>
        <Thead><Tr><Th>Date</Th><Th>Service</Th><Th isNumeric>Amount</Th></Tr></Thead>
        <Tbody>
          {rows.map((r: any, i: number) => (
            <Tr key={i}><Td>{r.date}</Td><Td>{r.service}</Td><Td isNumeric>{r.cost_amount?.toFixed?.(2) ?? r.amount?.toFixed?.(2)}</Td></Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  )
}
