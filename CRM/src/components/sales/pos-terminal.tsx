"use client"

import { useState, useTransition, useMemo } from "react"
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  User,
  UserCheck,
  Tag,
  Percent,
  Sparkles,
  Package,
  Pill,
  Stethoscope,
  Boxes,
  RotateCcw,
  Receipt,
  Layers,
  Phone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/format"
import { toast } from "sonner"
import {
  createSale,
  searchSalesCustomers,
  type SalesCatalogItem,
  type SalesReceiptData,
} from "@/actions/sales"
import { ReceiptModal } from "@/components/sales/receipt-modal"

type CartItem = {
  item: SalesCatalogItem
  quantity: number
  unitPrice: number
  discountAmount: number
  taxRatePercent: number
}

export function PosTerminal({ catalog }: { catalog: SalesCatalogItem[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
  const [cart, setCart] = useState<CartItem[]>([])
  
  // Customer selection
  const [customerType, setCustomerType] = useState<"walkin" | "registered">("walkin")
  const [walkInName, setWalkInName] = useState("")
  const [walkInPhone, setWalkInPhone] = useState("")
  const [patientSearch, setPatientSearch] = useState("")
  const [patientResults, setPatientResults] = useState<{ id: string; name: string; uhid: string; phone: string }[]>([])
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string; uhid: string; phone: string } | null>(null)
  const [isSearchingPatient, setIsSearchingPatient] = useState(false)

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI" | "CARD" | "NET_BANKING" | "SPLIT">("UPI")
  const [upiRef, setUpiRef] = useState("")
  const [orderDiscount, setOrderDiscount] = useState<number>(0)
  const [taxRate, setTaxRate] = useState<number>(0) // 0%, 5%, 12%, 18%
  const [splitCash, setSplitCash] = useState<string>("")
  const [splitUpi, setSplitUpi] = useState<string>("")
  const [splitCard, setSplitCard] = useState<string>("")

  // Checkout modal
  const [receiptData, setReceiptData] = useState<SalesReceiptData | null>(null)
  const [receiptModalOpen, setReceiptModalOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Categories extraction
  const categories = useMemo(() => {
    const cats = new Set<string>()
    catalog.forEach((item) => cats.add(item.category))
    return ["ALL", ...Array.from(cats)]
  }, [catalog])

  // Filtered catalog
  const filteredCatalog = useMemo(() => {
    return catalog.filter((item) => {
      const matchesCategory = selectedCategory === "ALL" || item.category === selectedCategory
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesCategory && matchesSearch
    })
  }, [catalog, selectedCategory, searchQuery])

  // Cart operations
  function addToCart(item: SalesCatalogItem) {
    if (item.type === "PRODUCT" && item.stock !== undefined && item.stock <= 0) {
      toast.error(`${item.name} is currently out of stock!`)
      return
    }

    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id)
      if (existing) {
        if (item.type === "PRODUCT" && item.stock !== undefined && existing.quantity >= item.stock) {
          toast.warning(`Maximum available stock reached (${item.stock} units).`)
          return prev
        }
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        )
      }
      return [
        ...prev,
        {
          item,
          quantity: 1,
          unitPrice: item.price,
          discountAmount: 0,
          taxRatePercent: taxRate,
        },
      ]
    })
  }

  function updateQuantity(itemId: string, delta: number) {
    setCart((prev) => {
      return prev
        .map((ci) => {
          if (ci.item.id === itemId) {
            const nextQty = ci.quantity + delta
            if (nextQty <= 0) return null
            if (ci.item.type === "PRODUCT" && ci.item.stock !== undefined && nextQty > ci.item.stock) {
              toast.warning(`Maximum available stock is ${ci.item.stock}.`)
              return ci
            }
            return { ...ci, quantity: nextQty }
          }
          return ci
        })
        .filter(Boolean) as CartItem[]
    })
  }

  function removeFromCart(itemId: string) {
    setCart((prev) => prev.filter((ci) => ci.item.id !== itemId))
  }

  function clearCart() {
    setCart([])
    setOrderDiscount(0)
  }

  // Live Calculations
  const cartSubtotal = cart.reduce((sum, ci) => sum + ci.unitPrice * ci.quantity - ci.discountAmount, 0)
  const cartTax = (cartSubtotal * taxRate) / 100
  const finalTotal = Math.max(0, cartSubtotal + cartTax - orderDiscount)

  // Patient live search
  async function handlePatientSearch(text: string) {
    setPatientSearch(text)
    if (text.trim().length >= 2) {
      setIsSearchingPatient(true)
      try {
        const results = await searchSalesCustomers(text)
        setPatientResults(results)
      } finally {
        setIsSearchingPatient(false)
      }
    } else {
      setPatientResults([])
    }
  }

  // Complete Sale
  function handleCheckout() {
    if (cart.length === 0) {
      toast.error("Cart is empty. Add items from the catalog.")
      return
    }

    if (customerType === "registered" && !selectedPatient) {
      toast.error("Please search and select a registered patient, or switch to Walk-in.")
      return
    }

    startTransition(async () => {
      try {
        const payload = {
          patientId: customerType === "registered" ? selectedPatient?.id : undefined,
          walkInName: customerType === "walkin" ? walkInName.trim() || "Walk-in Customer" : undefined,
          walkInPhone: customerType === "walkin" ? walkInPhone.trim() || undefined : undefined,
          items: cart.map((ci) => ({
            itemId: ci.item.id,
            type: ci.item.type,
            name: ci.item.name,
            quantity: ci.quantity,
            unitPrice: ci.unitPrice,
            discountAmount: ci.discountAmount,
            taxRatePercent: taxRate,
          })),
          discountAmount: orderDiscount,
          paymentMethod,
          upiReference: paymentMethod === "UPI" ? upiRef : undefined,
          splitPayments:
            paymentMethod === "SPLIT"
              ? {
                  cash: Number(splitCash) || 0,
                  upi: Number(splitUpi) || 0,
                  card: Number(splitCard) || 0,
                }
              : undefined,
        }

        const receipt = await createSale(payload)
        setReceiptData(receipt)
        setReceiptModalOpen(true)
        toast.success(`Sale completed! Invoice #${receipt.billNumber}`)

        // Reset cart
        setCart([])
        setOrderDiscount(0)
        setWalkInName("")
        setWalkInPhone("")
        setSelectedPatient(null)
        setPatientSearch("")
        setUpiRef("")
        setSplitCash("")
        setSplitUpi("")
        setSplitCard("")
      } catch (err: any) {
        toast.error(err?.message || "Failed to process sale.")
      }
    })
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Product & Service Catalog (Col 1-7) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Category Filter Bar */}
          <div className="space-y-3 bg-card p-4 rounded-xl border shadow-xs">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services or products by name, SKU…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-background text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat === "ALL" ? "All Items" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredCatalog.length === 0 ? (
              <div className="col-span-full text-center py-12 border rounded-xl bg-card/50">
                <Package className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                <p className="font-semibold text-sm text-foreground">No items match your query</p>
                <p className="text-xs text-muted-foreground mt-0.5">Try searching with a different term or category</p>
              </div>
            ) : (
              filteredCatalog.map((item) => {
                const inCart = cart.find((ci) => ci.item.id === item.id)
                const isOutOfStock = item.type === "PRODUCT" && item.stock !== undefined && item.stock <= 0

                return (
                  <Card
                    key={item.id}
                    onClick={() => !isOutOfStock && addToCart(item)}
                    className={`relative overflow-hidden cursor-pointer transition-all border select-none group hover:shadow-md hover:border-primary/50 ${
                      inCart ? "ring-2 ring-primary bg-primary/5 border-primary" : "bg-card"
                    } ${isOutOfStock ? "opacity-60 cursor-not-allowed bg-muted/40" : "active:scale-[0.98]"}`}
                  >
                    <CardContent className="p-3 sm:p-3.5 space-y-2">
                      <div className="flex items-start justify-between gap-1">
                        <div
                          className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                            item.type === "SERVICE"
                              ? "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {item.type === "SERVICE" ? <Stethoscope className="h-4 w-4" /> : <Pill className="h-4 w-4" />}
                        </div>

                        {inCart && (
                          <Badge className="h-5 px-1.5 text-[10px] font-bold bg-primary text-primary-foreground">
                            ×{inCart.quantity}
                          </Badge>
                        )}
                      </div>

                      <div>
                        <h3 className="font-semibold text-xs sm:text-sm text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{item.category}</p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-border/40">
                        <span className="font-bold text-xs sm:text-sm text-foreground">
                          {formatCurrency(item.price)}
                        </span>
                        {item.type === "PRODUCT" && (
                          <span
                            className={`text-[10px] font-medium ${
                              isOutOfStock
                                ? "text-destructive font-semibold"
                                : item.stock !== undefined && item.stock <= 5
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-muted-foreground"
                            }`}
                          >
                            {isOutOfStock ? "Out of Stock" : `Stock: ${item.stock}`}
                          </span>
                        )}
                        {item.type === "SERVICE" && item.durationMinutes && (
                          <span className="text-[10px] text-muted-foreground">{item.durationMinutes}m</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>

        {/* Right Column: Interactive POS Cart & Checkout Terminal (Col 8-12) */}
        <div className="lg:col-span-5 bg-card rounded-xl border shadow-sm p-4 sm:p-5 space-y-4 sticky top-20">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-foreground">Active Order Pad</h2>
                <p className="text-[11px] text-muted-foreground">{cart.length} unique item{cart.length === 1 ? "" : "s"}</p>
              </div>
            </div>
            {cart.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="h-7 text-xs text-muted-foreground hover:text-destructive gap-1 px-2"
              >
                <RotateCcw className="h-3 w-3" /> Clear
              </Button>
            )}
          </div>

          {/* Customer Selection Block */}
          <div className="bg-muted/40 p-3 rounded-lg border space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-primary" /> Customer Info
              </Label>
              <div className="flex items-center gap-1 bg-background p-0.5 rounded-md border text-[11px]">
                <button
                  type="button"
                  onClick={() => setCustomerType("walkin")}
                  className={`px-2 py-0.5 rounded font-medium transition-all ${
                    customerType === "walkin" ? "bg-primary text-primary-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Walk-in
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerType("registered")}
                  className={`px-2 py-0.5 rounded font-medium transition-all ${
                    customerType === "registered" ? "bg-primary text-primary-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Registered
                </button>
              </div>
            </div>

            {customerType === "walkin" ? (
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Customer Name (optional)"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  className="h-8 text-xs bg-background"
                />
                <Input
                  placeholder="Phone (optional)"
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value)}
                  className="h-8 text-xs bg-background"
                />
              </div>
            ) : (
              <div className="space-y-1.5 relative">
                {selectedPatient ? (
                  <div className="flex items-center justify-between p-2 rounded-md bg-background border text-xs">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-emerald-600" />
                      <div>
                        <span className="font-semibold text-foreground">{selectedPatient.name}</span>
                        <span className="text-[10px] text-muted-foreground ml-1.5">({selectedPatient.uhid})</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatient(null)
                        setPatientSearch("")
                      }}
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div>
                    <Input
                      placeholder="Search patient by name, UHID, or phone…"
                      value={patientSearch}
                      onChange={(e) => handlePatientSearch(e.target.value)}
                      className="h-8 text-xs bg-background"
                    />
                    {isSearchingPatient && <p className="text-[10px] text-muted-foreground mt-1">Searching…</p>}
                    {patientResults.length > 0 && (
                      <div className="absolute left-0 right-0 top-9 bg-card border rounded-lg shadow-lg z-20 max-h-40 overflow-y-auto divide-y text-xs">
                        {patientResults.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              setSelectedPatient(p)
                              setPatientResults([])
                            }}
                            className="p-2 hover:bg-muted/80 cursor-pointer flex justify-between items-center"
                          >
                            <div>
                              <p className="font-semibold text-foreground">{p.name}</p>
                              <p className="text-[10px] text-muted-foreground">{p.uhid} • {p.phone}</p>
                            </div>
                            <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2">Select</Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1 divide-y divide-border/40">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-8 w-8 mx-auto opacity-30 mb-1.5" />
                <p className="text-xs font-medium">Cart is empty</p>
                <p className="text-[11px] text-muted-foreground/80">Click any product or service to add</p>
              </div>
            ) : (
              cart.map((ci) => (
                <div key={ci.item.id} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">{ci.item.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatCurrency(ci.unitPrice)} each
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1 border rounded-md p-0.5 bg-muted/30">
                    <button
                      type="button"
                      onClick={() => updateQuantity(ci.item.id, -1)}
                      className="h-6 w-6 rounded flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-xs font-bold w-5 text-center">{ci.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(ci.item.id, 1)}
                      className="h-6 w-6 rounded flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="text-right w-16 shrink-0">
                    <p className="text-xs font-bold text-foreground">
                      {formatCurrency(ci.unitPrice * ci.quantity - ci.discountAmount)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(ci.item.id)}
                    className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Pricing Summary & Discounts */}
          <div className="border-t pt-3 space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal:</span>
              <span className="font-semibold text-foreground">{formatCurrency(cartSubtotal)}</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground flex items-center gap-1">
                <Tag className="h-3 w-3 text-emerald-600" /> Order Discount (₹):
              </span>
              <Input
                type="number"
                min="0"
                value={orderDiscount || ""}
                onChange={(e) => setOrderDiscount(Math.max(0, Number(e.target.value) || 0))}
                placeholder="0"
                className="w-24 h-7 text-right text-xs bg-background"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground flex items-center gap-1">
                <Percent className="h-3 w-3" /> GST / Tax Rate:
              </span>
              <div className="flex items-center gap-1">
                {[0, 5, 12, 18].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setTaxRate(rate)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all ${
                      taxRate === rate
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>

            {taxRate > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Tax ({taxRate}%):</span>
                <span>+{formatCurrency(cartTax)}</span>
              </div>
            )}

            <div className="flex justify-between text-base font-bold text-foreground pt-2 border-t">
              <span>Total Payable:</span>
              <span className="text-primary text-lg">{formatCurrency(finalTotal)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2 pt-1 border-t">
            <Label className="text-xs font-semibold text-foreground">Payment Mode</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: "UPI", label: "UPI", icon: Smartphone },
                { id: "CASH", label: "Cash", icon: Banknote },
                { id: "CARD", label: "Card", icon: CreditCard },
                { id: "SPLIT", label: "Split", icon: Layers },
              ].map((m) => {
                const Icon = m.icon
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      paymentMethod === m.id
                        ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                        : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="text-[11px]">{m.label}</span>
                  </button>
                )
              })}
            </div>

            {paymentMethod === "UPI" && (
              <Input
                placeholder="UPI Reference / UTR Number (Optional)"
                value={upiRef}
                onChange={(e) => setUpiRef(e.target.value)}
                className="h-8 text-xs bg-background mt-2"
              />
            )}

            {paymentMethod === "SPLIT" && (
              <div className="grid grid-cols-3 gap-1.5 pt-1.5">
                <div>
                  <Label className="text-[10px] text-muted-foreground">Cash (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={splitCash}
                    onChange={(e) => setSplitCash(e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">UPI (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={splitUpi}
                    onChange={(e) => setSplitUpi(e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">Card (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={splitCard}
                    onChange={(e) => setSplitCard(e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Primary Checkout Button */}
          <Button
            size="lg"
            disabled={cart.length === 0 || isPending}
            onClick={handleCheckout}
            className="w-full h-11 text-sm font-bold gap-2 shadow-md"
          >
            {isPending ? (
              "Processing Sale…"
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Complete Sale & Issue Receipt • {formatCurrency(finalTotal)}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        receipt={receiptData}
        open={receiptModalOpen}
        onOpenChange={setReceiptModalOpen}
      />
    </>
  )
}
