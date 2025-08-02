"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, FileText, CheckCircle, XCircle, Download, Users, GraduationCap, Trophy, RefreshCw } from "lucide-react"

interface ImportResult {
	success: boolean
	message: string
	stats?: {
		total_rows: number
		created: number
		updated: number
		errors: number
	}
	errors?: string[]
	detectedTables?: string[]
}

export default function ImportPage() {
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [isUploading, setIsUploading] = useState(false)
	const [uploadProgress, setUploadProgress] = useState(0)
	const [importResult, setImportResult] = useState<ImportResult | null>(null)
	const [previewData, setPreviewData] = useState<any[]>([])

	const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file && file.type === "text/csv") {
			setSelectedFile(file)
			setImportResult(null)
			// Preview the CSV data
			previewCSV(file)
		} else {
			alert("Please select a valid CSV file")
		}
	}, [])

	const previewCSV = (file: File) => {
		const reader = new FileReader()
		reader.onload = (e) => {
			const text = e.target?.result as string
			const lines = text.split("\n").slice(0, 6) // Preview first 5 rows + header
			const data = lines.map((line) => {
				// Simple CSV parser for preview
				const result: string[] = []
				let current = ''
				let inQuotes = false

				for (let i = 0; i < line.length; i++) {
					const char = line[i]
					if (char === '"') {
						inQuotes = !inQuotes
					} else if (char === ',' && !inQuotes) {
						result.push(current.trim())
						current = ''
					} else {
						current += char
					}
				}
				result.push(current.trim())
				return result
			})
			setPreviewData(data)
		}
		reader.readAsText(file)
	}

	const handleImport = async () => {
		if (!selectedFile) return

		setIsUploading(true)
		setUploadProgress(0)
		setImportResult(null)

		try {
			// Simulate progress
			const progressInterval = setInterval(() => {
				setUploadProgress((prev) => {
					if (prev >= 90) {
						clearInterval(progressInterval)
						return 90
					}
					return prev + 10
				})
			}, 200)

			// Create FormData for file upload
			const formData = new FormData()
			formData.append('file', selectedFile)

			// Make API request (no import type needed - it's auto-detected)
			const response = await fetch('/api/import', {
				method: 'POST',
				body: formData,
			})

			clearInterval(progressInterval)
			setUploadProgress(100)

			const result: ImportResult = await response.json()

			if (!response.ok) {
				throw new Error(result.message || 'Import failed')
			}

			setImportResult(result)

		} catch (error) {
			console.error('Import error:', error)
			setImportResult({
				success: false,
				message: error instanceof Error ? error.message : 'Import failed',
				errors: [error instanceof Error ? error.message : 'Unknown error occurred']
			})
		} finally {
			setIsUploading(false)
		}
	}

	const downloadTemplate = (type: string) => {
		let csvContent = ""

		switch (type) {
			case "students":
				csvContent = "username,name,email,uuid\n"
				csvContent += "yasser.al-agoul,Yasser AL-AGOUL,yk198620@gmail.com,f11517a7-50a0-410e-bdb4-5910269ebbda\n"
				csvContent += "marie.dubois,Marie DUBOIS,marie.dubois@email.com,a22518b8-61b1-521f-cdc5-6021370fcceb"
				break
			case "grades":
				csvContent = "username,exam 00,exam 01,exam 02,final exam,uuid\n"
				csvContent += "yasser.al-agoul,45,78,89,92,f11517a7-50a0-410e-bdb4-5910269ebbda\n"
				csvContent += "marie.dubois,67,85,72,88,a22518b8-61b1-521f-cdc5-6021370fcceb"
				break
			case "rush_teams":
				csvContent = "username,square,sky scraper,rosetta stone,uuid\n"
				csvContent += "yasser.al-agoul,85,92,,f11517a7-50a0-410e-bdb4-5910269ebbda\n"
				csvContent += "marie.dubois,78,,95,a22518b8-61b1-521f-cdc5-6021370fcceb"
				break
		}

		const blob = new Blob([csvContent], { type: "text/csv" })
		const url = URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = `${type}_template.csv`
		a.click()
		URL.revokeObjectURL(url)
	}

	return (
		<div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
			<div className="flex items-center justify-between space-y-2">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">Import Data</h2>
					<p className="text-muted-foreground">Upload CSV files to import student data, grades, and team assignments</p>
				</div>
			</div>

			<Tabs defaultValue="upload" className="space-y-4">
				<TabsList>
					<TabsTrigger value="upload">Upload Data</TabsTrigger>
					<TabsTrigger value="templates">Download Templates</TabsTrigger>
				</TabsList>

				<TabsContent value="upload" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						{/* Upload Form */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Upload className="h-5 w-5" />
									Smart CSV Import
								</CardTitle>
								<CardDescription>Upload any CSV file - the system will automatically detect and import student data, exam grades, and rush evaluations</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="csv-file">CSV File</Label>
									<Input id="csv-file" type="file" accept=".csv" onChange={handleFileSelect} disabled={isUploading} />
									{selectedFile && (
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											<FileText className="h-4 w-4" />
											{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
										</div>
									)}
								</div>

								{isUploading && (
									<div className="space-y-2">
										<div className="flex items-center justify-between text-sm">
											<span>Analyzing and importing data...</span>
											<span>{uploadProgress}%</span>
										</div>
										<Progress value={uploadProgress} />
									</div>
								)}

								<Button onClick={handleImport} disabled={!selectedFile || isUploading} className="w-full">
									{isUploading ? (
										<>
											<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
											Processing...
										</>
									) : (
										<>
											<Upload className="mr-2 h-4 w-4" />
											Smart Import
										</>
									)}
								</Button>
							</CardContent>
						</Card>

						{/* Preview and Results */}
						<Card>
							<CardHeader>
								<CardTitle>Preview & Results</CardTitle>
								<CardDescription>Preview your data before import and view results after processing</CardDescription>
							</CardHeader>
							<CardContent>
								{previewData.length > 0 && !importResult && (
									<div className="space-y-2">
										<h4 className="font-medium">Data Preview (first 5 rows)</h4>
										<div className="border rounded-md overflow-hidden">
											<Table>
												<TableHeader>
													<TableRow>
														{previewData[0]?.map((header, index) => (
															<TableHead key={index} className="text-xs">
																{header}
															</TableHead>
														))}
													</TableRow>
												</TableHeader>
												<TableBody>
													{previewData.slice(1).map((row, rowIndex) => (
														<TableRow key={rowIndex}>
															{row.map((cell, cellIndex) => (
																<TableCell key={cellIndex} className="text-xs">
																	{cell}
																</TableCell>
															))}
														</TableRow>
													))}
												</TableBody>
											</Table>
										</div>
									</div>
								)}

								{importResult && (
									<div className="space-y-4">
										<Alert
											className={importResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
										>
											{importResult.success ? (
												<CheckCircle className="h-4 w-4 text-green-600" />
											) : (
												<XCircle className="h-4 w-4 text-red-600" />
											)}
											<AlertTitle>{importResult.success ? "Smart Import Successful" : "Import Failed"}</AlertTitle>
											<AlertDescription>
												{importResult.message}
												{importResult.detectedTables && (
													<div className="mt-2">
														<strong>Detected data types:</strong> {importResult.detectedTables.join(', ')}
													</div>
												)}
											</AlertDescription>
										</Alert>

										{importResult.stats && (
											<div className="grid grid-cols-2 gap-4 text-sm">
												<div>
													<span className="font-medium">Total Rows:</span> {importResult.stats.total_rows}
												</div>
												<div>
													<span className="font-medium">Created:</span> {importResult.stats.created}
												</div>
												<div>
													<span className="font-medium">Updated:</span> {importResult.stats.updated}
												</div>
												<div>
													<span className="font-medium">Errors:</span> {importResult.stats.errors}
												</div>
											</div>
										)}

										{importResult.errors && importResult.errors.length > 0 && (
											<Alert className="border-red-200 bg-red-50">
												<XCircle className="h-4 w-4 text-red-600" />
												<AlertTitle>Errors</AlertTitle>
												<AlertDescription>
													<ul className="list-disc list-inside space-y-1 max-h-40 overflow-y-auto">
														{importResult.errors.map((error, index) => (
															<li key={index} className="text-sm">{error}</li>
														))}
													</ul>
												</AlertDescription>
											</Alert>
										)}
									</div>
								)}

								{!previewData.length && !importResult && (
									<div className="text-center py-8 text-muted-foreground">
										<FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
										<p>Select a CSV file to preview data</p>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="templates" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-3">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Users className="h-5 w-5" />
									Student Data Template
								</CardTitle>
								<CardDescription>Template for importing initial student information</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-2 text-sm">
									<p>
										<strong>Required Fields:</strong>
									</p>
									<ul className="list-disc list-inside space-y-1 text-muted-foreground">
										<li>Username (unique, from your existing data)</li>
										<li>Full name</li>
										<li>Email address</li>
										<li>UUID (optional - will be generated if missing)</li>
									</ul>
									<p className="text-xs text-amber-600 mt-2">
										<strong>Note:</strong> Your CSV can have any column order. The system will find the right columns automatically.
									</p>
								</div>
								<Button onClick={() => downloadTemplate("students")} className="w-full mt-4" variant="outline">
									<Download className="mr-2 h-4 w-4" />
									Download Template
								</Button>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<GraduationCap className="h-5 w-5" />
									Exam Grades Template
								</CardTitle>
								<CardDescription>Template for importing exam scores and validation status</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-2 text-sm">
									<p>
										<strong>Required Fields:</strong>
									</p>
									<ul className="list-disc list-inside space-y-1 text-muted-foreground">
										<li>Username (to identify student)</li>
										<li>Exam columns: "exam 00", "exam 01", "exam 02", "final exam"</li>
										<li>Grades (numeric values, 0-100)</li>
									</ul>
									<p className="text-xs text-amber-600 mt-2">
										<strong>Note:</strong> The system will extract grades from multiple exam columns in the same row.
									</p>
								</div>
								<Button onClick={() => downloadTemplate("grades")} className="w-full mt-4" variant="outline">
									<Download className="mr-2 h-4 w-4" />
									Download Template
								</Button>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Trophy className="h-5 w-5" />
									Rush Teams Template
								</CardTitle>
								<CardDescription>Template for importing rush project team assignments</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-2 text-sm">
									<p>
										<strong>Required Fields:</strong>
									</p>
									<ul className="list-disc list-inside space-y-1 text-muted-foreground">
										<li>Team name (unique)</li>
										<li>Project type (square, skyscraper, rosetta_stone)</li>
										<li>Member UUIDs (2-4 members)</li>
										<li>Team grade (optional, 0-100)</li>
									</ul>
									<p className="text-xs text-amber-600 mt-2">
										<strong>Note:</strong> If a team exists, members will be replaced with the new list.
									</p>
								</div>
								<Button onClick={() => downloadTemplate("rush_teams")} className="w-full mt-4" variant="outline">
									<Download className="mr-2 h-4 w-4" />
									Download Template
								</Button>
							</CardContent>
						</Card>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Import Guidelines</CardTitle>
							<CardDescription>Important information about CSV file formatting and requirements</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<h4 className="font-medium">File Requirements</h4>
									<ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>Files must be in CSV format (.csv)</li>
										<li>First row must contain column headers</li>
										<li>Use UTF-8 encoding for special characters</li>
										<li>Maximum file size: 10MB</li>
										<li>UUIDs must be valid UUID format</li>
									</ul>
								</div>
								<div className="space-y-2">
									<h4 className="font-medium">Data Validation</h4>
									<ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>Email addresses must be valid format</li>
										<li>Usernames must be unique and lowercase</li>
										<li>Grades must be numeric (0-100)</li>
										<li>Exam names must match: exam00, exam01, exam02, final_exam</li>
										<li>Rush projects: square, skyscraper, rosetta_stone</li>
									</ul>
								</div>
							</div>

							<div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
								<h4 className="font-medium text-blue-900 mb-2">CRUD Operations</h4>
								<div className="text-sm text-blue-800 space-y-1">
									<p><strong>Students:</strong> Create new or update existing based on username</p>
									<p><strong>Grades:</strong> Create new or update existing based on student + exam combination</p>
									<p><strong>Rush Teams:</strong> Create new or update existing based on team name, replacing all members</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	)
}
