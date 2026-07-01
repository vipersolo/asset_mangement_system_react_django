import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Card,
  Badge,
  Modal,
  Form,
  Spinner,
  Row,
  Col,
  InputGroup,
} from "react-bootstrap";
import {
  PlusCircle,
  PencilSquare,
  Trash,
  Cpu,
  UpcScan,
  Calendar3,
  InfoCircle,
  BoxSeam,
} from "react-bootstrap-icons";
import api from "../api/axios";

const emptyForm = {
  name: "",
  type: "",
  serial_number: "",
  status: "available",
  purchase_date: new Date().toISOString().split("T")[0],
};

const ManageAssets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const res = await api.get("assets/");
      setAssets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingAsset(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      type: asset.type,
      serial_number: asset.serial_number,
      status: asset.status,
      purchase_date: asset.purchase_date,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingAsset) {
        await api.put(`assets/${editingAsset.id}/`, formData);
      } else {
        await api.post("assets/", formData);
      }
      setShowModal(false);
      setEditingAsset(null);
      setFormData(emptyForm);
      fetchAssets();
    } catch (err) {
      alert(err.response?.data?.serial_number || "Error saving asset");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this asset?")) return;
    await api.delete(`assets/${id}/`);
    fetchAssets();
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{minHeight:"70vh"}}>
        <Spinner animation="border" variant="primary"/>
      </div>
    );
  }

  const statusVariant = (status)=>{
    switch(status){
      case "available": return "success";
      case "assigned": return "primary";
      case "repair": return "danger";
      default: return "secondary";
    }
  };

  return (
    <div className="p-3">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Hardware Registry</h2>
          <p className="text-muted mb-0">Manage and track all registered hardware assets.</p>
        </div>

        <Button  onClick={handleAdd} className="shadow-sm px-4">
          <PlusCircle className="me-2"/>
          Add New Asset
        </Button>
      </div>

      <Card className="border-0 shadow-sm" style={{borderRadius:16}}>
        <Card.Body className="p-0">

          {assets.length===0 ? (
            <div className="text-center py-5">
              <BoxSeam size={54} className="text-secondary mb-3"/>
              <h5 className="fw-bold">No Assets Found</h5>
              <p className="text-muted mb-0">Click <strong>Add New Asset</strong> to register your first asset.</p>
            </div>
          ) : (
            <Table responsive hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Asset</th>
                  <th>Type</th>
                  <th>Serial Number</th>
                  <th>Status</th>
                  <th>Purchase Date</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {assets.map((asset)=>(
                  <tr key={asset.id}>
                    <td className="ps-4">
                      <div className="fw-bold">{asset.name}</div>
                    </td>

                    <td>{asset.type}</td>

                    <td>
                      <code className="bg-light px-2 py-1 rounded">
                        {asset.serial_number}
                      </code>
                    </td>

                    <td>
                      <Badge bg={statusVariant(asset.status)} pill className="px-3 py-2">
                        {asset.status.toUpperCase()}
                      </Badge>
                    </td>

                    <td>{asset.purchase_date}</td>

                    <td className="text-end pe-4">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="rounded-circle me-2"
                        style={{width:38,height:38}}
                        onClick={()=>handleEdit(asset)}
                      >
                        <PencilSquare/>
                      </Button>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="rounded-circle"
                        style={{width:38,height:38}}
                        onClick={()=>handleDelete(asset.id)}
                      >
                        <Trash/>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={()=>setShowModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">
            {editingAsset ? "Edit Asset" : "Register New Hardware"}
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSave}>
          <Modal.Body className="pt-4">

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Asset Name</Form.Label>
              <InputGroup>
                <InputGroup.Text><Cpu/></InputGroup.Text>
                <Form.Control
                  value={formData.name}
                  onChange={(e)=>setFormData({...formData,name:e.target.value})}
                  required
                />
              </InputGroup>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Type</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><InfoCircle/></InputGroup.Text>
                    <Form.Control
                      value={formData.type}
                      onChange={(e)=>setFormData({...formData,type:e.target.value})}
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e)=>setFormData({...formData,status:e.target.value})}
                  >
                    <option value="available">Available</option>
                    <option value="assigned">Assigned</option>
                    <option value="repair">Repair</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Serial Number</Form.Label>
              <InputGroup>
                <InputGroup.Text><UpcScan/></InputGroup.Text>
                <Form.Control
                  value={formData.serial_number}
                  disabled={editingAsset!==null}
                  onChange={(e)=>setFormData({...formData,serial_number:e.target.value})}
                  required
                />
              </InputGroup>
            </Form.Group>

            <Form.Group>
              <Form.Label className="fw-semibold">Purchase Date</Form.Label>
              <InputGroup>
                <InputGroup.Text><Calendar3/></InputGroup.Text>
                <Form.Control
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e)=>setFormData({...formData,purchase_date:e.target.value})}
                  required
                />
              </InputGroup>
            </Form.Group>

          </Modal.Body>

          <Modal.Footer className="border-0">
            <Button variant="light" onClick={()=>setShowModal(false)}>
              Cancel
            </Button>

            <Button type="submit">
              {editingAsset ? "Update Asset" : "Save Asset"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageAssets;
