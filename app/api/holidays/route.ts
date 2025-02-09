import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { CreateBankHolidayInput } from '@/types/bank-holiday'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/auth.config'

// GET all holidays for company
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.role.includes('ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const holidays = await prisma.bank_holidays.findMany({
      where: { company_id: Number(session.user.companyId) },
      orderBy: { date: 'asc' }
    })

    return NextResponse.json(holidays)
  } catch (error) {
    console.error('GET Error:', error)
    return NextResponse.json({ error: 'Failed to fetch holidays' }, { status: 500 })
  }
}

// POST create new holiday
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.role.includes('ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as CreateBankHolidayInput
    
    if (!session.user.companyId) {
      return NextResponse.json({ error: 'Company ID not found' }, { status: 400 })
    }
    
    // Validate date
    const date = new Date(body.date)
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    const companyId = Number(session.user.companyId)
    
    // Verify company exists
    const company = await prisma.companies.findUnique({
      where: { id: companyId }
    })
    
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 400 })
    }

    const newHoliday = await prisma.bank_holidays.create({
      data: {
        name: body.name,
        date,
        company_id: Number(session.user.companyId),
        created_at: new Date(),
        updated_at: new Date(),
      } as Prisma.bank_holidaysUncheckedCreateInput
    })

    return NextResponse.json(newHoliday)
  } catch (error) {
    console.error('POST Error:', error)
    return NextResponse.json({ error: 'Failed to create holiday' }, { status: 500 })
  }
}

// PUT update existing holiday
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.role.includes('ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate date
    const date = new Date(body.date)
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    const updatedHoliday = await prisma.bank_holidays.update({
      where: { id: body.id },
      data: {
        name: body.name,
        date,
        updated_at: new Date(),
      }
    })

    return NextResponse.json(updatedHoliday)
  } catch (error) {
    console.error('PUT Error:', error)
    return NextResponse.json({ error: 'Failed to update holiday' }, { status: 500 })
  }
}

// DELETE remove holiday
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.role.includes('ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await request.json()

    await prisma.bank_holidays.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE Error:', error)
    return NextResponse.json({ error: 'Failed to delete holiday' }, { status: 500 })
  }
}
