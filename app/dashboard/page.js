"use client"
import { useSession, signOut } from 'next-auth/react';
import {
  Bell,
  CircleUser,
  Home,
  LineChart,
  Menu,
  Package,
  Package2,
  Search,
  ShoppingCart,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@nextui-org/react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

import {
  CaretSortIcon,
  ChevronDownIcon,
  DotsHorizontalIcon,
} from '@radix-ui/react-icons';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from '@/components/ui/sheet';
  
import Link from 'next/link';
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';



const extractTextFromEmail = (emailBody) => {
  const htmlParser = new DOMParser();
  const doc = htmlParser.parseFromString(emailBody, 'text/html');
  
  // Remove script and style tags
  doc.querySelectorAll('script, style').forEach((element) => element.remove());

  // Get text content and normalize spaces
  const textContent = doc.body.textContent || '';
  return textContent.replace(/\s+/g, ' ').trim();
};


const fetchEmails = async (numEmails, filterValue) => {
  const response = await fetch(
    `/api/fetchEmails?maxResults=${numEmails}`
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error fetching emails');
  }

  // Filter emails based on the input value
  const filteredEmails = data.emails.filter((email) =>
    email.subject.includes(filterValue)
  );

  // Extract text content for classification
  const emailsWithText = filteredEmails.map(email => ({
    ...email,
    textContent: extractTextFromEmail(email.body)
  }));

  // Log extracted text for each email
  emailsWithText.forEach(email => {
    console.log(`Text for classification for email with id ${email.id}: ${email.textContent}`);
  });

  return emailsWithText;
};




export function Dashboard() {
    const { data: session } = useSession();
    const [emails, setEmails] = useState([]);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [filterValue, setFilterValue] = useState('');
    const [numEmails, setNumEmails] = useState(() => {
      const savedNumEmails = localStorage.getItem('numEmails');
      return savedNumEmails ? parseInt(savedNumEmails, 10) : 15;
    });
  
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isLoading, setIsLoading] = useState(false);
  
    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});
    const [rowSelection, setRowSelection] = useState({});
    const [isClassifying, setIsClassifying] = useState(false);

    
    const handleSignOut = () => {
      const email = session.user.email;
      const userData = localStorage.getItem(`emails-${email}`);
      localStorage.clear();
      if (userData) {
        localStorage.setItem(`emails-${email}`, userData);
      }
      signOut({ callbackUrl: '/login' });
    };

    const classifyEmails = async () => {
      if (!session) {
        console.error('No session found');
        return;
      }
    
      const userEmail = session.user.email;
      const emails = JSON.parse(localStorage.getItem(`emails-${userEmail}`));
      const openAiKey = localStorage.getItem(`openAiKey-${userEmail}`);
    
      if (!emails || !openAiKey) {
        alert('Emails or OpenAI key not found in local storage.');
        return;
      }
    
      setIsClassifying(true);
      try {
        const response = await fetch('/api/classifyEmails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ emails, openAiKey }),
        });
    
        const classifiedEmails = await response.json();
        setEmails(classifiedEmails);
      } catch (error) {
        console.error('Error classifying emails:', error);
      } finally {
        setIsClassifying(false);
      }
    };
    
      
     
  
      const columns = [
        {
          id: 'select',
          header: ({ table }) => (
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && 'indeterminate')
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label='Select all'
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label='Select row'
            />
          ),
          enableSorting: false,
          enableHiding: false,
        },
        {
          accessorKey: 'subject',
          header: ({ column }) => (
            <Button
              variant='ghost'
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            >
              Subject
              <CaretSortIcon className='ml-2 h-4 w-4' />
            </Button>
          ),
          cell: ({ row }) => (
            <div className='capitalize'>{row.getValue('subject')}</div>
          ),
        },
        {
          accessorKey: 'from',
          header: 'From',
          cell: ({ row }) => (
            <div className='lowercase'>{row.getValue('from')}</div>
          ),
        },
        {
          accessorKey: 'date',
          header: () => <div className='text-right'>Date</div>,
          cell: ({ row }) => (
            <div className='text-right font-medium'>{row.getValue('date')}</div>
          ),
        },
        {
          accessorKey: 'category',
          header: 'Category',
          cell: ({ row }) => (
            <div className='capitalize'>
              {row.getValue('category') || 'Not classified yet'}
            </div>
          ),
        },
        {
          id: 'actions',
          enableHiding: false,
          cell: ({ row }) => {
            const email = row.original;
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' className='h-8 w-8 p-0'>
                    <span className='sr-only'>Open menu</span>
                    <DotsHorizontalIcon className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(email.id)}
                  >
                    Copy email ID
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedEmail(email);
                      onOpen();
                    }}
                  >
                    View email
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          },
        },
      ];

      const fetchRecentEmails = async () => {
  setIsLoading(true);
  setTimeout(async () => {
    try {
      const fetchedEmails = await fetchEmails(numEmails, filterValue);
      setEmails(fetchedEmails);
      localStorage.setItem(
        `emails-${session.user.email}`,
        JSON.stringify(fetchedEmails)
      );
    } catch (err) {
      console.error('Failed to fetch emails:', err);
    } finally {
      setIsLoading(false);
    }
  }, 2000); // Delay of 2 seconds
};

      
      
      
  
    const table = useReactTable({
      data: emails,
      columns,
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      onColumnVisibilityChange: setColumnVisibility,
      onRowSelectionChange: setRowSelection,
      state: {
        sorting,
        columnFilters,
        columnVisibility,
        rowSelection,
      },
    });
  
    useEffect(() => {
      const fetchAndUpdateEmails = () => {
        if (session) {
          fetchEmails(numEmails, filterValue)
            .then((fetchedEmails) => {
              setEmails(fetchedEmails);
              localStorage.setItem(
                `emails-${session.user.email}`,
                JSON.stringify(fetchedEmails)
              );
            })
            .catch((err) => console.error('Failed to fetch emails:', err));
        }
      };
      fetchAndUpdateEmails();
     

  
    
    }, [session, numEmails, filterValue]);

    useEffect(() => {
      const style = document.createElement('style');
      style.innerHTML = `
        @keyframes spTexture {
          from {
            background-position: 0 0;
          }
          to {
            background-position: -1rem 0;
          }
        }
      `;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }, []);
    
  
    useEffect(() => {
      localStorage.setItem('numEmails', numEmails);
    }, [numEmails]);

    useEffect(() => {
      const style = document.createElement('style');
      style.innerHTML = `
        @keyframes blinkCursor {
          50% {
            border-right-color: transparent;
          }
        }
    
        @keyframes typeAndDelete {
          0%, 10% {
            width: 0;
          }
          45%, 55% {
            width: 6.2em;
          }
          90%, 100% {
            width: 0;
          }
        }
      `;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }, []);
    
  
    useEffect(() => {
      const savedNumEmails = localStorage.getItem('numEmails');
      if (savedNumEmails) {
        setNumEmails(parseInt(savedNumEmails, 10));
      }
    }, []);
  
    return (
      <>
      <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
  <SheetContent className="overflow-y-auto scrollbar-hide" style={{ width: '100%', maxWidth: '60vw', minWidth: '400px', sm: { maxWidth: '400px' }, md: { maxWidth: '600px' }, lg: { maxWidth: '600px' }, xl: { maxWidth: '600px' } }}>
    <SheetHeader>
      <SheetTitle>{selectedEmail?.subject}</SheetTitle>
      <SheetDescription>
        <strong>From:</strong> {selectedEmail?.from}
        <br />
        <strong>Date:</strong> {selectedEmail?.date}
        <br />
        <strong>Category:</strong> {selectedEmail?.category || 'Not classified yet'}
      </SheetDescription>
    </SheetHeader>
    <div className="py-4">
      {selectedEmail?.body ? (
        <div className="prose max-w-full" dangerouslySetInnerHTML={{ __html: selectedEmail.body }} />
      ) : (
        <p>No Content</p>
      )}
      {selectedEmail?.attachments && selectedEmail.attachments.length > 0 && (
        <div className="mt-4">
          <h4>Attachments:</h4>
          <ul className="space-y-2">
            {selectedEmail.attachments.map((attachment, index) => (
              <li key={index} className="whitespace-normal overflow-hidden text-ellipsis">
                <a href={`https://mail.google.com/mail/u/0?ui=2&ik=&view=att&th=${selectedEmail.id}&attid=0.${index}&disp=safe&zw`} target="_blank" rel="noopener noreferrer" className="block">
                  {attachment.filename} ({attachment.mimeType}, {attachment.size} bytes)
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
    <SheetFooter>
      <SheetClose asChild>
        <Button onClick={onClose}>Close</Button>
      </SheetClose>
    </SheetFooter>
  </SheetContent>
</Sheet>





  
        <div className='grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]'>
          <div className='hidden border-r bg-muted/40 md:block'>
            <div className='flex h-full max-h-screen flex-col gap-2'>
              <div className='flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6'>
                <Link
                  href='/'
                  className='flex items-center gap-2 font-semibold'
                >
                  <Package2 className='h-6 w-6' />
                  <span className=''>Change API Key !?</span>
                </Link>
              
              </div>
              <div className='flex-1'>
                <nav className='grid items-start px-2 text-sm font-medium lg:px-4'>
                  <Link
                    href='#'
                    className='flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary'
                  >
                    <Home className='h-4 w-4' />
                    Dashboard
                    <Badge className='ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full'>
  {numEmails}
</Badge>

                  </Link>
                  <Link
                    href='#'
                    className='flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary'
                  >
                    <ShoppingCart className='h-4 w-4' />
                    Recent $ (Dummy)
                   
                  </Link>
                  <Link
                    href='#'
                    className='flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary'
                  >
                    <Package className='h-4 w-4' />
                    Your Products (Dummy){' '}
                  </Link>
                  <Link
                    href='#'
                    className='flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary'
                  >
                    <Users className='h-4 w-4' />
                    Team Users (Dummy)
                  </Link>
                  <Link
                    href='#'
                    className='flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary'
                  >
                    <LineChart className='h-4 w-4' />
                    Analytics (Dummy)
                  </Link>
                </nav>
              </div>
              <div className='mt-auto p-4'>
                <Card x-chunk='dashboard-02-chunk-0'>
                  <CardHeader className='p-2 pt-0 md:p-4'>
                    <CardTitle>Upgrade to Pro</CardTitle>
                    <CardDescription>
                      Unlock all features and classify mails , Checkout our Team Plan and get unlimited access to our support
                      team.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='p-2 pt-0 md:p-4 md:pt-0'>
                    <Button size='sm' className='w-full'>
                      Upgrade
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          <div className='flex flex-col'>
            <header className='flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6'>
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant='outline'
                    size='icon'
                    className='shrink-0 md:hidden'
                  >
                    <Menu className='h-5 w-5' />
                    <span className='sr-only'>Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side='left' className='flex flex-col'>
                  <nav className='grid gap-2 text-lg font-medium'>
                    <Link
                      href='#'
                      className='flex items-center gap-2 text-lg font-semibold'
                    >
                      <Package2 className='h-6 w-6' />
                      <span className='sr-only'>Acme Inc</span>
                    </Link>
                    <Link
                      href='#'
                      className='mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground'
                    >
                      <Home className='h-5 w-5' />
                      Dashboard
                      <Badge className='ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full'>
  {numEmails}
</Badge>
                    </Link>
                    <Link
                      href='#'
                      className='mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground'
                    >
                      <ShoppingCart className='h-5 w-5' />
                      Recent $ (Dummy)
                     
                    </Link>
                    <Link
                      href='#'
                      className='mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground'
                    >
                      <Package className='h-5 w-5' />
                      Your Products (Dummy)
                    </Link>
                    <Link
                      href='#'
                      className='mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground'
                    >
                      <Users className='h-5 w-5' />
                      Team Users (Dummy)
                    </Link>
                    <Link
                      href='#'
                      className='mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground'
                    >
                      <LineChart className='h-5 w-5' />
                      Analytics (Dummy)
                    </Link>
                  </nav>
                  <div className='mt-auto'>
                    <Card>
                      <CardHeader>
                        <CardTitle>Upgrade to Pro</CardTitle>
                        <CardDescription>
                          Unlock all features and get unlimited access to our
                          support team.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button size='sm' className='w-full'>
                          Upgrade
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </SheetContent>
              </Sheet>
              <div className='w-full flex-1'>
                {session && (
                  <div className='flex flex-col'>
                    <span className='font-medium text-slate-900 dark:text-slate-50'>
                      {session.user.name}
                    </span>
                    <span className='text-sm text-slate-600 dark:text-slate-400'>
                      {session.user.email}
                    </span>
                  </div>
                )}
              </div>
              <div className='flex items-center gap-4'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='secondary'
                      size='icon'
                      className='rounded-full'
                    >
                      <CircleUser className='h-5 w-5' />
                      <span className='sr-only'>Toggle user menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem>Support</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        const email = session.user.email;
                        const userData = localStorage.getItem(
                          `emails-${email}`
                        );
                        localStorage.clear();
                        if (userData) {
                          localStorage.setItem(`emails-${email}`, userData);
                        }
                        signOut({ callbackUrl: '/login' });
                      }}
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>
  
            <main className='flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6'>
              <div className='w-full'>
                <div className='flex items-center py-4'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='outline' className='mr-4'>
                        {numEmails} Emails
                        <ChevronDownIcon className='ml-2 h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='start'>
                      {[2,10, 15, 25, 50, 100].map((number) => (
                        <DropdownMenuItem
                          key={number}
                          onClick={() => setNumEmails(number)}
                        >
                          {number} Emails
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
  
                  <Input
                    placeholder='Filter emails...'
                    value={
                      table.getColumn('subject')?.getFilterValue() ?? ''
                    }
                    onChange={(event) =>
                      table
                        .getColumn('subject')
                        ?.setFilterValue(event.target.value)
                    }
                    className='max-w-sm'
                  />



  
                  <div className='flex items-center ml-auto'>
                  <Button className='ml-2' onClick={fetchRecentEmails}>Fetch Recent Mails</Button>
                  <Button className='ml-2' onClick={classifyEmails}>Classify</Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='outline' className='mr-2'>
                          Columns
                          <ChevronDownIcon className='ml-2 h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
  
                      <DropdownMenuContent align='end'>
                        {table
                          .getAllColumns()
                          .filter((column) => column.getCanHide())
                          .map((column) => {
                            return (
                              <DropdownMenuCheckboxItem
                                key={column.id}
                                className='capitalize'
                                checked={column.getIsVisible()}
                                onCheckedChange={(value) =>
                                  column.toggleVisibility(!!value)
                                }
                              >
                                {column.id}
                              </DropdownMenuCheckboxItem>
                            );
                          })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
  
                <div className='rounded-md border'>
                <div className='rounded-md border'>
  {isLoading ? (
    <div className="terminal-loader" style={{
      border: "0.1em solid #333",
      backgroundColor: "#1a1a1a",
      color: "#0f0",
      fontFamily: "\"Courier New\", Courier, monospace",
      fontSize: "1em",
      padding: "1.5em 1em",
      width: "12em",
      margin: "100px auto",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      borderRadius: "4px",
      position: "relative",
      overflow: "hidden",
      boxSizing: "border-box",
      textAlign: "center"
    }}>
      <div className="terminal-header" style={{
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
        height: "1.5em",
        backgroundColor: "#333",
        borderTopLeftRadius: "4px",
        borderTopRightRadius: "4px",
        padding: "0 0.4em",
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div className="terminal-title" style={{ color: "#eee" }}>Status</div>
        <div className="terminal-controls" style={{ display: "flex" }}>
          <div className="control close" style={{
            display: "inline-block",
            width: "0.6em",
            height: "0.6em",
            marginLeft: "0.4em",
            borderRadius: "50%",
            backgroundColor: "#e33"
          }}></div>
          <div className="control minimize" style={{
            display: "inline-block",
            width: "0.6em",
            height: "0.6em",
            marginLeft: "0.4em",
            borderRadius: "50%",
            backgroundColor: "#ee0"
          }}></div>
          <div className="control maximize" style={{
            display: "inline-block",
            width: "0.6em",
            height: "0.6em",
            marginLeft: "0.4em",
            borderRadius: "50%",
            backgroundColor: "#0b0"
          }}></div>
        </div>
      </div>
      <div className="text" style={{
        display: "inline-block",
        whiteSpace: "nowrap",
        overflow: "hidden",
        borderRight: "0.2em solid green", /* Cursor */
        animation: "typeAndDelete 4s steps(11) infinite, blinkCursor 0.5s step-end infinite alternate",
        marginTop: "1.5em"
      }}>Loading...</div>
    </div>
  ) :  isClassifying ? (
    <div className="loader" style={{
      clear: 'both',
      width: '2rem',
      height: '2rem',
      margin: '1rem auto',
      border: '0.0625rem #000 solid',
      borderRadius: '0.25rem',
      position: 'relative',
      background: 'linear-gradient(45deg, transparent 49%, #000 50%, #000 50%, transparent 51%, transparent), linear-gradient(-45deg, transparent 49%, #000 50%, #000 50%, transparent 51%, transparent)',
      backgroundSize: '1rem 1rem',
      backgroundPosition: '0% 0%',
      animation: 'spTexture 1s infinite linear'
    }}></div>
  ) : (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={
                row.getIsSelected() && 'selected'
              }
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className='h-24 text-center'
            >
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )}
</div>


                </div>
                <div className='flex items-center justify-end space-x-2 py-4'>
                  <div className='flex-1 text-sm text-muted-foreground'>
                    {table.getFilteredSelectedRowModel().rows.length} of{' '}
                    {table.getFilteredRowModel().rows.length} row(s)
                    selected.
                  </div>
                  <div className='space-x-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      Previous
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </>
    );
  }
  

  
export default Dashboard;
