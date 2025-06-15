"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, RotateCcw, Plus, Trash2 } from "lucide-react"

export default function AnimatedRankingApp() {
  const [currentMonth, setCurrentMonth] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState([1000])
  const [showDataInput, setShowDataInput] = useState(false)
  const [newDimension, setNewDimension] = useState("")
  const [newValues, setNewValues] = useState("")
  const [csvError, setCsvError] = useState("")
  const [metric, setMetric] = useState("GDP (Trillions USD)")
  const intervalRef = useRef(null)

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const [data, setData] = useState([
    { dimension: "USA", values: [21.4, 21.6, 21.8, 22.0, 22.2, 22.4, 22.6, 22.8, 23.0, 23.2, 23.4, 23.6] },
    { dimension: "China", values: [14.3, 14.5, 14.7, 14.9, 15.1, 15.3, 15.5, 15.7, 15.9, 16.1, 16.3, 16.5] },
    { dimension: "Japan", values: [5.1, 5.0, 4.9, 4.8, 4.9, 5.0, 5.1, 5.2, 5.1, 5.0, 4.9, 5.0] },
    { dimension: "Germany", values: [3.8, 3.9, 4.0, 4.1, 4.0, 3.9, 3.8, 3.9, 4.0, 4.1, 4.2, 4.3] },
    { dimension: "India", values: [2.9, 3.0, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.0] },
    { dimension: "UK", values: [2.8, 2.7, 2.6, 2.7, 2.8, 2.9, 3.0, 2.9, 2.8, 2.7, 2.8, 2.9] },
    { dimension: "France", values: [2.6, 2.7, 2.8, 2.7, 2.6, 2.7, 2.8, 2.9, 2.8, 2.7, 2.8, 2.9] },
    { dimension: "Brazil", values: [1.8, 1.9, 2.0, 1.9, 1.8, 1.9, 2.0, 2.1, 2.0, 1.9, 2.0, 2.1] },
  ])

  const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"]

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentMonth((prev) => {
          if (prev >= months.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, speed[0])
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, speed])

  const getCurrentRanking = () => {
    return data
      .map((item, index) => ({
        ...item,
        currentValue: item.values[currentMonth] || 0,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.currentValue - a.currentValue)
  }

  const maxValue = Math.max(...data.flatMap((d) => d.values))

  const handlePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentMonth(0)
  }

  const addDimension = () => {
    if (newDimension && newValues) {
      const values = newValues
        .split(",")
        .map((v) => Number.parseFloat(v.trim()))
        .filter((v) => !isNaN(v))

      if (values.length === months.length) {
        setData([...data, { dimension: newDimension, values }])
        setNewDimension("")
        setNewValues("")
      }
    }
  }

  const removeDimension = (index) => {
    setData(data.filter((_, i) => i !== index))
  }

  const handleCsvUpload = async (file) => {
    try {
      const text = await file.text()
      const lines = text.trim().split("\n")

      if (lines.length < 2) {
        setCsvError("CSV must have at least 2 rows (header + data)")
        return
      }

      const header = lines[0].split(",").map((h) => h.trim())
      const newMonths = header.slice(1)

      if (newMonths.length === 0) {
        setCsvError("CSV must have month columns")
        return
      }

      const newData = []
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",").map((cell) => cell.trim())
        if (row.length !== header.length) continue

        const dimension = row[0]
        const values = row.slice(1).map((v) => {
          const num = Number.parseFloat(v)
          return isNaN(num) ? 0 : num
        })

        if (dimension) {
          newData.push({ dimension, values })
        }
      }

      if (newData.length === 0) {
        setCsvError("No valid data rows found")
        return
      }

      setData(newData)
      setMetric("Uploaded Metric")
      setCsvError("")
      setCurrentMonth(0)
      setIsPlaying(false)
    } catch (error) {
      setCsvError("Error parsing CSV file")
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file && file.type === "text/csv") {
      handleCsvUpload(file)
    } else {
      setCsvError("Please select a valid CSV file")
    }
  }

  const downloadSampleCSV = () => {
    const sampleCSVContent = `Dimension,Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec
USA,21.4,21.6,21.8,22.0,22.2,22.4,22.6,22.8,23.0,23.2,23.4,23.6
China,14.3,14.5,14.7,14.9,15.1,15.3,15.5,15.7,15.9,16.1,16.3,16.5
Japan,5.1,5.0,4.9,4.8,4.9,5.0,5.1,5.2,5.1,5.0,4.9,5.0
Germany,3.8,3.9,4.0,4.1,4.0,3.9,3.8,3.9,4.0,4.1,4.2,4.3
India,2.9,3.0,3.1,3.2,3.3,3.4,3.5,3.6,3.7,3.8,3.9,4.0
UK,2.8,2.7,2.6,2.7,2.8,2.9,3.0,2.9,2.8,2.7,2.8,2.9
France,2.6,2.7,2.8,2.7,2.6,2.7,2.8,2.9,2.8,2.7,2.8,2.9
Brazil,1.8,1.9,2.0,1.9,1.8,1.9,2.0,2.1,2.0,1.9,2.0,2.1`

    const blob = new Blob([sampleCSVContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "sample-data-template.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const ranking = getCurrentRanking()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-800">Animated Ranking Visualization</h1>
          <p className="text-slate-600">Watch your data come to life with animated rankings over time</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Month: {months[currentMonth]}</Label>
                <div className="flex gap-2">
                  <Button onClick={handlePlay} variant="outline" size="sm">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button onClick={handleReset} variant="outline" size="sm">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Animation Speed: {speed[0]}ms (50-1000ms)</Label>
                <Slider value={speed} onValueChange={setSpeed} max={1000} min={50} step={50} className="w-full" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metric">Metric Name</Label>
                <Input
                  id="metric"
                  value={metric}
                  onChange={(e) => setMetric(e.target.value)}
                  placeholder="Enter metric name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="csvUpload">Upload CSV Data</Label>
                <div className="flex gap-2">
                  <Input
                    id="csvUpload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="cursor-pointer flex-1"
                  />
                  <Button onClick={downloadSampleCSV} variant="outline" size="sm" className="whitespace-nowrap">
                    Download Template
                  </Button>
                </div>
                {csvError && <p className="text-sm text-red-600">{csvError}</p>}
                <div className="text-xs text-slate-500 space-y-1">
                  <p>• First column: dimension names (e.g., countries, teams, schools)</p>
                  <p>• Remaining columns: monthly values (numbers only)</p>
                  <p>• Download template above for exact format</p>
                </div>
              </div>

              <Button onClick={() => setShowDataInput(!showDataInput)} variant="outline" className="w-full">
                {showDataInput ? "Hide" : "Show"} Data Input
              </Button>
            </CardContent>
          </Card>

          {/* Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{metric}</span>
                <span className="text-lg font-mono">{months[currentMonth]}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 h-96 overflow-hidden relative">
                {ranking.map((item, index) => (
                  <div
                    key={item.dimension}
                    className="absolute w-full transition-all duration-500 ease-in-out"
                    style={{
                      transform: `translateY(${index * 45}px)`,
                    }}
                  >
                    <div className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm border">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: item.color }}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-sm">{item.dimension}</span>
                          <span className="text-sm font-mono">{item.currentValue.toFixed(1)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              backgroundColor: item.color,
                              width: `${(item.currentValue / maxValue) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Input */}
        {showDataInput && (
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newDimension">New Dimension</Label>
                  <Input
                    id="newDimension"
                    value={newDimension}
                    onChange={(e) => setNewDimension(e.target.value)}
                    placeholder="e.g., Canada"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newValues">Values (comma-separated)</Label>
                  <Input
                    id="newValues"
                    value={newValues}
                    onChange={(e) => setNewValues(e.target.value)}
                    placeholder="e.g., 1.7,1.8,1.9,2.0,2.1,2.2,2.3,2.4,2.5,2.6,2.7,2.8"
                  />
                </div>
              </div>
              <Button onClick={addDimension} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Dimension
              </Button>

              <div className="space-y-2">
                <Label>Current Dimensions</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {data.map((item, index) => (
                    <div key={item.dimension} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="font-medium">{item.dimension}</span>
                      <Button onClick={() => removeDimension(index)} variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
